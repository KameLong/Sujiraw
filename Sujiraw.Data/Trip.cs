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

namespace Sujiro.Data
{
    public class Trip : BaseTable
    {
        public static readonly string TABLE_NAME = "Trip";

        public long TripID { get; set; }
        public long RouteID { get; set; }
        public int Direction { get; set; }
        public int TripSeq { get; set; }

        public long TrainTypeID { get; set; }

        public string Name { get; set; } = "";
        public string Number { get; set; } = "";
        public string Comment { get; set; } = "";

        public long DepStationID { get; set; } = 0;
        public long AriStationID { get; set; } = 0;
        public int DepTime { get; set; } = -1;
        public int AriTime { get; set; } = -1;



        public Trip(long routeID,long trainTypeID)
        {
            TripID = MyRandom.NextSafeLong();
            RouteID = routeID;
            TrainTypeID = trainTypeID;

        }
        public Trip(DbDataReader reader)
        {
            TripID = reader.GetInt64(nameof(TripID));
            RouteID = reader.GetInt64(nameof(RouteID));
            Direction = reader.GetInt32(nameof(Direction));
            TripSeq = reader.GetInt32(nameof(TripSeq));
            TrainTypeID = reader.GetInt64(nameof(TrainTypeID));
            Name = reader.GetString(nameof(Name));
            Number = reader.GetString(nameof(Number));
            Comment = reader.GetString(nameof(Comment));
            DepStationID = reader.GetInt64(nameof(DepStationID));
            AriStationID = reader.GetInt64(nameof(AriStationID));
            DepTime = reader.GetInt32(nameof(DepTime));
            AriTime = reader.GetInt32(nameof(AriTime));
        }

        static public Trip GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(TripID)}=@{nameof(TripID)}";
                command.Parameters.Add(new SqliteParameter(nameof(TripID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new Trip(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public void Insert(DbConnection conn, List<Trip> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(TripID)},{nameof(RouteID)},{nameof(Direction)},{nameof(TripSeq)},{nameof(TrainTypeID)},{nameof(Name)},{nameof(Number)},{nameof(Comment)},{nameof(DepStationID)},{nameof(AriStationID)},{nameof(DepTime)},{nameof(AriTime)}) " +
                    $"values (@{nameof(TripID)},@{nameof(RouteID)},@{nameof(Direction)},@{nameof(TripSeq)},@{nameof(TrainTypeID)},@{nameof(Name)},@{nameof(Number)},@{nameof(Comment)},@{nameof(DepStationID)},@{nameof(AriStationID)},@{nameof(DepTime)},@{nameof(AriTime)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(RouteID)} = EXCLUDED.{nameof(RouteID)},{nameof(Direction)} = EXCLUDED.{nameof(Direction)},{nameof(TripSeq)} = EXCLUDED.{nameof(TripSeq)},{nameof(TrainTypeID)} = EXCLUDED.{nameof(TrainTypeID)},{nameof(Name)} = EXCLUDED.{nameof(Name)},{nameof(Number)} = EXCLUDED.{nameof(Number)},{nameof(Comment)} = EXCLUDED.{nameof(Comment)},{nameof(DepStationID)} = EXCLUDED.{nameof(DepStationID)},{nameof(AriStationID)} = EXCLUDED.{nameof(AriStationID)},{nameof(DepTime)} = EXCLUDED.{nameof(DepTime)},{nameof(AriTime)} = EXCLUDED.{nameof(AriTime)}";

                command.Parameters.Add(CreateParameter(command, nameof(TripID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(RouteID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Direction), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(TripSeq), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(TrainTypeID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Name), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(Number), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(Comment), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(DepStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(AriStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(DepTime), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(AriTime), DbType.Int32));

                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(TripID)].Value = item.TripID;
                    command.Parameters[nameof(RouteID)].Value = item.RouteID;
                    command.Parameters[nameof(Direction)].Value = item.Direction;
                    command.Parameters[nameof(TripSeq)].Value = item.TripSeq;
                    command.Parameters[nameof(TrainTypeID)].Value = item.TrainTypeID;
                    command.Parameters[nameof(Name)].Value = item.Name;
                    command.Parameters[nameof(Number)].Value = item.Number;
                    command.Parameters[nameof(Comment)].Value = item.Comment;
                    command.Parameters[nameof(DepStationID)].Value = item.DepStationID;
                    command.Parameters[nameof(AriStationID)].Value = item.AriStationID;
                    command.Parameters[nameof(DepTime)].Value = item.DepTime;
                    command.Parameters[nameof(AriTime)].Value = item.AriTime;

                    command.ExecuteNonQuery();
                }
            }
        }
        static public IEnumerable<Trip> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Trip(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<Trip> GetAllTrip()
        {
            return Trip.GetAll(this.conn).ToList();
        }
        public Trip GetTrip(long stationID)
        {
            return Trip.GetByID(this.conn, stationID);
        }
        public void InsertTrip(List<Trip> stations)
        {
            Trip.Insert(this.conn, stations);
        }
    }

}
