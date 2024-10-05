using Microsoft.Data.Sqlite;
using Npgsql;
using NpgsqlTypes;
using Sujiro.Data.Common;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Data.Common;
using static System.Net.Mime.MediaTypeNames;

namespace System.Data.Common
{


}
namespace Sujiro.Data
{
    [Table(TABLE_NAME)]
    public class Station : BaseTable
    {
        public const string TABLE_NAME = "station";

        public long StationID { get; set; }
        public long CompanyID { get; set; }
        public string Name { get; set; } = "";
        public string ShortName { get; set; } = "";

        public float Lat { get; set; } = 35;
        public float Lon { get; set; } = 135;

        public Station(long companyID)
        {
            CompanyID = companyID;  
            StationID = MyRandom.NextSafeLong();
        }

        public Station(DbDataReader reader)
        {
            StationID = reader.GetInt64(nameof(StationID));
            CompanyID = reader.GetInt64(nameof(CompanyID));
            Name = reader.GetString(nameof(Name));
            ShortName = reader.GetString(nameof(ShortName));
            Lat = reader.GetFloat(nameof(Lat));
            Lon = reader.GetFloat(nameof(Lon));

            //NpgsqlPoint pos = (NpgsqlPoint)reader.GetValue("pos");
            //Latitude = (float)pos.Y;
            //Longitude = (float)pos.X;
        }

        static public Station GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(StationID)}=@{nameof(StationID)}";
                command.Parameters.Add(new SqliteParameter(nameof(StationID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new Station(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public void Insert(DbConnection conn, List<Station> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(StationID)},{nameof(CompanyID)},{nameof(Name)},{nameof(ShortName)},{nameof(Lat)},{nameof(Lon)}) " +
                    $"values (@{nameof(StationID)},@{nameof(CompanyID)},@{nameof(Name)},@{nameof(ShortName)},@{nameof(Lat)},@{nameof(Lon)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(Name)} = EXCLUDED.{nameof(Name)},{nameof(ShortName)} = EXCLUDED.{nameof(ShortName)},{nameof(Lat)} = EXCLUDED.{nameof(Lat)},{nameof(Lon)} = EXCLUDED.{nameof(Lon)}";

                command.Parameters.Add(CreateParameter(command, nameof(StationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(CompanyID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Name), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(ShortName), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(Lat), DbType.Single));
                command.Parameters.Add(CreateParameter(command, nameof(Lon), DbType.Single));



                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(StationID)].Value = item.StationID;
                    command.Parameters[nameof(CompanyID)].Value = item.CompanyID;
                    command.Parameters[nameof(Name)].Value = item.Name;
                    command.Parameters[nameof(ShortName)].Value = item.ShortName;
                    command.Parameters[nameof(Lat)].Value = item.Lat;
                    command.Parameters[nameof(Lon)].Value = item.Lon;
                    command.ExecuteNonQuery();
                }
            }
        }
        static public IEnumerable<Station> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Station(reader);
                    }
                }
            }
        }
        static public IEnumerable<Station> GetFromCompany(DbConnection conn,long companyID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(CompanyID)}= @{nameof(CompanyID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(CompanyID), companyID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Station(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<Station> GetAllStation()
        {
            return Station.GetAll(this.conn).ToList();
        }
        public List<Station> GetStationsFromCompany(long companyID)
        {
            return Station.GetFromCompany(this.conn,companyID).ToList();
        }
        public Station GetStation(long stationID)
        {
            return Station.GetByID(this.conn, stationID);
        }
        public void InsertStation(List<Station>stations)
        {
            Station.Insert(this.conn, stations);
        }
    }

}
