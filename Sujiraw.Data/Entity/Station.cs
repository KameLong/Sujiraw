using System.ComponentModel.DataAnnotations.Schema;

namespace Sujiraw.Data.Entity;
using System.ComponentModel.DataAnnotations;
[Table("station")]
public class Station
{
        [Key]
        [Column("stationid")]
        public long StationId { get; set; }
        [Column("companyid")]
        public long CompanyId { get; set; }
        [Column("name")]
        public string Name { get; set; } = "";
        [Column("shortname")]
        public string ShortName { get; set; } = "";

        [Column("lat")]
        public float Lat { get; set; } = 35;
        [Column("lon")]
        public float Lon { get; set; } = 135;
}