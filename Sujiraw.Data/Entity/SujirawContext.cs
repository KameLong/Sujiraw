
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Sujiraw.Data.Entity{
    



    public class SujirawContext:DbContext
    {
        private readonly string _connectionString;
        public DbSet<StopTime> StopTime{get;set;} 
        public DbSet<Trip> Trip{get;set;} 
        public DbSet<Company> Company{get;set;} 
        public DbSet<Route> Route { get; set; }
        public DbSet<Station> Station { get; set; }
        public DbSet<Train> Train { get; set; }
        public DbSet<TrainType> TrainType { get; set; }
        public DbSet<RouteStation> RouteStation { get; set; }
        public DbSet<TimeTable> TimeTable { get; set; }
        public DbSet<TimeTableStation> TimeTableStation { get; set; }

        public SujirawContext(string connectionString) : base()
        {
            this._connectionString= connectionString;
            
        }
        
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<StopTime>()
                .HasKey(st => new { st.TripId, routestationId = st.RouteStationId });
            base.OnModelCreating(modelBuilder);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            => optionsBuilder.UseNpgsql(_connectionString);
    }
}