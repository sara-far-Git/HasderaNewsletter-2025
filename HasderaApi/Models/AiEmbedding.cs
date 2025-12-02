using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class AiEmbedding
{
    public int EmbeddingId { get; set; }

    public int? IssueId { get; set; }

    public int? ArticleId { get; set; }

    public string TextChunk { get; set; } = null!;

    public string Vector { get; set; } = null!;

    public virtual Article? Article { get; set; }

    public virtual Issue? Issue { get; set; }
}
