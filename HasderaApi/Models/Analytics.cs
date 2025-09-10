namespace HasderaApi.Models
{
    /// <summary>
    /// ���� ��������� � ����� ����� �����������
    /// </summary>
    public class Analytics
    {
        /// <summary>
        /// ���� ������ ��� �����
        /// </summary>
        public int analytics_id { get; set; }

        /// <summary>
        /// �� ��� �� �����
        /// </summary>
        public string page_name { get; set; } = string.Empty;

        /// <summary>
        /// ���� ������
        /// </summary>
        public int clicks { get; set; }

        /// <summary>
        /// ���� �����/������
        /// </summary>
        public int impressions { get; set; }

        /// <summary>
        /// ����� ����� �������
        /// </summary>
        public DateTime created_at { get; set; }
    }
}
