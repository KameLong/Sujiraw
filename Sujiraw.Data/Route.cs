using Microsoft.Data.Sqlite;
using Sujiro.Data.Common;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data;
using System.Linq;
using System.Reflection.Metadata;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using Npgsql;

namespace Sujiro.Data
{
    public class Route:BaseTable
    {
        public static readonly string TABLE_NAME = "Route";

        public long RouteID { get; set; }
        public long CompanyID { get; set; }
        public string Name { get; set; } = "";
        public string Color { get; set; } = "#000000";
        public Route(long companyID)
        {
            RouteID = MyRandom.NextSafeLong();
            CompanyID = companyID;
        }
        public Route(DbDataReader reader)
        {
            RouteID = reader.GetInt64(nameof(RouteID));
            CompanyID = reader.GetInt64(nameof(CompanyID));
            Name = reader.GetString(nameof(Name));
            Color = reader.GetString(nameof(Color));
        }

        static public Route GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(RouteID)}=@{nameof(RouteID)}";
                command.Parameters.Add(new SqliteParameter(nameof(RouteID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new Route(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public void Insert(DbConnection conn, List<Route> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(RouteID)},{nameof(CompanyID)},{nameof(Name)},{nameof(Color)}) " +
                    $"values (@{nameof(RouteID)},@{nameof(CompanyID)},@{nameof(Name)},@{nameof(Color)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(Name)} = EXCLUDED.{nameof(Name)},{nameof(Color)} = EXCLUDED.{nameof(Color)}";

                command.Parameters.Add(CreateParameter(command, nameof(RouteID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(CompanyID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Name), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(Color), DbType.String));
                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(RouteID)].Value = item.RouteID;
                    command.Parameters[nameof(CompanyID)].Value = item.CompanyID;
                    command.Parameters[nameof(Name)].Value = item.Name;
                    command.Parameters[nameof(Color)].Value = item.Color;
                    command.ExecuteNonQuery();
                }
            }
        }
        static public IEnumerable<Route> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Route(reader);
                    }
                }
            }
        }
        static public IEnumerable<Route> GetFromCompany(DbConnection conn,long companyID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(CompanyID)} = @{nameof(CompanyID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(CompanyID), companyID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Route(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<Route> GetAllRoute()
        {
            return Route.GetAll(this.conn).ToList();
        }
        public List<Route> GetFromCompany(long companyID)
        {
            return Route.GetFromCompany(this.conn,companyID).ToList();
        }
        public Route GetRoute(long stationID)
        {
            return Route.GetByID(this.conn, stationID);
        }
        public void InsertRoute(List<Route> stations)
        {
            Route.Insert(this.conn, stations);
        }
    }

}
