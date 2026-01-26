using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // DTO for category responses
        public class CategoryDto
        {
            public int CategoryId { get; set; }
            public string Name { get; set; } = string.Empty;
            public int ArticleCount { get; set; }
        }

        // DTO for creating/updating categories
        public class CategoryCreateDto
        {
            public string Name { get; set; } = string.Empty;
        }

        // GET /api/categories - Get all categories
        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetAll()
        {
            try
            {
                var categories = await _context.Categories
                    .AsNoTracking()
                    .Select(c => new CategoryDto
                    {
                        CategoryId = c.CategoryId,
                        Name = c.Name,
                        ArticleCount = c.Articles.Count
                    })
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                Console.WriteLine($"📂 Categories - Returning {categories.Count} categories");
                return Ok(categories);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting categories: {ex.Message}");
                return StatusCode(500, new { error = "Failed to get categories", details = ex.Message });
            }
        }

        // GET /api/categories/{id} - Get single category by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            try
            {
                var category = await _context.Categories
                    .AsNoTracking()
                    .Where(c => c.CategoryId == id)
                    .Select(c => new CategoryDto
                    {
                        CategoryId = c.CategoryId,
                        Name = c.Name,
                        ArticleCount = c.Articles.Count
                    })
                    .FirstOrDefaultAsync();

                if (category == null)
                {
                    return NotFound(new { error = "Category not found" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting category {id}: {ex.Message}");
                return StatusCode(500, new { error = "Failed to get category", details = ex.Message });
            }
        }

        // POST /api/categories - Create new category
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create([FromBody] CategoryCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new { error = "Category name is required" });
                }

                // Check for duplicate name
                var exists = await _context.Categories
                    .AnyAsync(c => c.Name.ToLower() == dto.Name.Trim().ToLower());

                if (exists)
                {
                    return Conflict(new { error = "Category with this name already exists" });
                }

                var category = new Category
                {
                    Name = dto.Name.Trim()
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Created category: {category.Name} (ID: {category.CategoryId})");

                return CreatedAtAction(nameof(GetById), new { id = category.CategoryId }, new CategoryDto
                {
                    CategoryId = category.CategoryId,
                    Name = category.Name,
                    ArticleCount = 0
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creating category: {ex.Message}");
                return StatusCode(500, new { error = "Failed to create category", details = ex.Message });
            }
        }

        // PUT /api/categories/{id} - Update category
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> Update(int id, [FromBody] CategoryCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new { error = "Category name is required" });
                }

                var category = await _context.Categories.FindAsync(id);
                if (category == null)
                {
                    return NotFound(new { error = "Category not found" });
                }

                // Check for duplicate name (excluding current category)
                var exists = await _context.Categories
                    .AnyAsync(c => c.CategoryId != id && c.Name.ToLower() == dto.Name.Trim().ToLower());

                if (exists)
                {
                    return Conflict(new { error = "Category with this name already exists" });
                }

                category.Name = dto.Name.Trim();
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Updated category {id}: {category.Name}");

                var articleCount = await _context.Articles.CountAsync(a => a.CategoryId == id);

                return Ok(new CategoryDto
                {
                    CategoryId = category.CategoryId,
                    Name = category.Name,
                    ArticleCount = articleCount
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating category {id}: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update category", details = ex.Message });
            }
        }

        // DELETE /api/categories/{id} - Delete category
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var category = await _context.Categories
                    .Include(c => c.Articles)
                    .FirstOrDefaultAsync(c => c.CategoryId == id);

                if (category == null)
                {
                    return NotFound(new { error = "Category not found" });
                }

                // Articles will have their CategoryId set to null due to SetNull delete behavior
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Deleted category {id}: {category.Name}");

                return Ok(new { message = "Category deleted successfully", articlesAffected = category.Articles.Count });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error deleting category {id}: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete category", details = ex.Message });
            }
        }

        // GET /api/categories/{id}/articles - Get articles in a category
        [HttpGet("{id}/articles")]
        public async Task<ActionResult<List<object>>> GetCategoryArticles(int id)
        {
            try
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == id);
                if (!categoryExists)
                {
                    return NotFound(new { error = "Category not found" });
                }

                var articles = await _context.Articles
                    .AsNoTracking()
                    .Where(a => a.CategoryId == id)
                    .Select(a => new
                    {
                        a.ArticleId,
                        a.Title,
                        a.Author,
                        a.Content,
                        a.IsHighlighted,
                        a.IssueId,
                        IssueTitle = a.Issue.Title,
                        IssueDate = a.Issue.IssueDate
                    })
                    .OrderByDescending(a => a.IssueDate)
                    .ToListAsync();

                return Ok(articles);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting articles for category {id}: {ex.Message}");
                return StatusCode(500, new { error = "Failed to get articles", details = ex.Message });
            }
        }
    }
}
