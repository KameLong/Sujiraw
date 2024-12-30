
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sujiraw.Data.Entity
{

    [Table("train")]
    public class Train
    {
        [Key]
        [Column("trainid")]
        public long TrainId { get; set; }
        [Column("companyid")]
        public long CompanyId { get; set; }

        [Column("depstationid")]
        public long DepStationId { get; set; }
        [Column("aristationid")]
        public long AriStationId { get; set; }
        [Column("deptime")]
        public int DepTime { get; set; }
        [Column("aritime")]
        public int AriTime { get; set; }

    }

}
