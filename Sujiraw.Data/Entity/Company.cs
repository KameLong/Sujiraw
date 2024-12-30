using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Sujiraw.Data.Entity
{
    [Table("company")]
    public class Company
    {
        [Key]
        [Column("companyid")]
        
        public long CompanyId { get; set; }
        [Column("name")]
        public string Name { get; set; } = "";
    }
}
