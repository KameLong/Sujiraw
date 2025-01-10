
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sujiraw.Data.Entity
{
    [Table("route")]
    public class Route
    {
        [Key]
        [Column("routeid")]
        public long RouteId { get; set; }
        [Column("companyid")]
        public long CompanyId { get; set; }
        [Column("name")]
        public string Name { get; set; } = "";
        [Column("color")]
        public string Color { get; set; } = "#000000";

        public ICollection<RouteStation> RouteStations { get; set; }
        public ICollection<Trip> Trips { get; set; }
    }
}
