
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

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
            modelBuilder.Entity<TimeTableStation>()
                .HasOne(s => s.TimeTable)
                .WithMany(a => a.TimeTableStations);
            modelBuilder.Entity<StopTime>()
                .HasOne(st=>st.Trip)
                .WithMany(trip=>trip.StopTimes);
            modelBuilder.Entity<Trip>()
                .HasOne(trip=>trip.Route)
                .WithMany(route=>route.Trips);
            modelBuilder.Entity<RouteStation>()
                .HasOne(rs=>rs.Route)
                .WithMany(route=>route.RouteStations);
            
            
            base.OnModelCreating(modelBuilder);
        }
        
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
                // ここに注目
                // .LogTo(
                //     message => Debug.WriteLine(message),
                //     new[] { DbLoggerCategory.Database.Name },
                //     LogLevel.Debug, 
                //     DbContextLoggerOptions.LocalTime)
                .UseNpgsql(_connectionString);
            
        }

    }
}