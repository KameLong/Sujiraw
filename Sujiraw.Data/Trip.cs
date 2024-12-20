﻿using Sujiraw.Data.Common;
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

namespace Sujiraw.Data
{
    public class Trip : BaseTable
    {
        public static readonly string TABLE_NAME = "Trip";

        public long TripID { get; set; }
        public long RouteID { get; set; }

        public long TrainID { get; set; }
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

        public List<StopTime> StopTimes = new List<StopTime>();

        public Trip(long routeID,long trainID,long trainTypeID)
        {
            TripID = MyRandom.NextSafeLong();
            RouteID = routeID;
            TrainID = trainID;
            TrainTypeID = trainTypeID;

        }
        public Trip(DbDataReader reader)
        {
            TripID = reader.GetInt64(nameof(TripID));
            RouteID = reader.GetInt64(nameof(RouteID));
            TrainID = reader.GetInt64(nameof(TrainID));
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
                command.Parameters.Add(new NpgsqlParameter(nameof(TripID), id));
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
                    $"INSERT INTO {TABLE_NAME} ({nameof(TripID)},{nameof(RouteID)},{nameof(TrainID)},{nameof(Direction)},{nameof(TripSeq)},{nameof(TrainTypeID)},{nameof(Name)},{nameof(Number)},{nameof(Comment)},{nameof(DepStationID)},{nameof(AriStationID)},{nameof(DepTime)},{nameof(AriTime)}) " +
                    $"values (@{nameof(TripID)},@{nameof(RouteID)},@{nameof(TrainID)},@{nameof(Direction)},@{nameof(TripSeq)},@{nameof(TrainTypeID)},@{nameof(Name)},@{nameof(Number)},@{nameof(Comment)},@{nameof(DepStationID)},@{nameof(AriStationID)},@{nameof(DepTime)},@{nameof(AriTime)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(RouteID)} = EXCLUDED.{nameof(RouteID)},{nameof(TrainID)} = EXCLUDED.{nameof(TrainID)},{nameof(Direction)} = EXCLUDED.{nameof(Direction)},{nameof(TripSeq)} = EXCLUDED.{nameof(TripSeq)},{nameof(TrainTypeID)} = EXCLUDED.{nameof(TrainTypeID)},{nameof(Name)} = EXCLUDED.{nameof(Name)},{nameof(Number)} = EXCLUDED.{nameof(Number)},{nameof(Comment)} = EXCLUDED.{nameof(Comment)},{nameof(DepStationID)} = EXCLUDED.{nameof(DepStationID)},{nameof(AriStationID)} = EXCLUDED.{nameof(AriStationID)},{nameof(DepTime)} = EXCLUDED.{nameof(DepTime)},{nameof(AriTime)} = EXCLUDED.{nameof(AriTime)}";

                command.Parameters.Add(CreateParameter(command, nameof(TripID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(RouteID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(TrainID), DbType.Int64));
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
                    command.Parameters[nameof(TrainID)].Value = item.TrainID;
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
        static public IEnumerable<Trip> GetByRoute(DbConnection conn,long routeID,int direction)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(RouteID)}=@routeID and {nameof(Direction)}=@direction order by {nameof(TripSeq)}";
                command.Parameters.Add(new NpgsqlParameter("@routeID", routeID));
                command.Parameters.Add(new NpgsqlParameter("@direction", direction));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Trip(reader);
                    }
                }
            }
        }
        static public IEnumerable<Trip> GetByRoute(DbConnection conn, long routeID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(RouteID)}=@routeID  order by {nameof(TripSeq)}";
                command.Parameters.Add(new NpgsqlParameter("@routeID", routeID));
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
        public List<Trip> GetTripByRoute(long routeID,int direction)
        {
            return Trip.GetByRoute(this.conn, routeID, direction).ToList();
        }
        public List<Trip> GetTripByRoute(long routeID)
        {
            return Trip.GetByRoute(this.conn, routeID).ToList();
        }
        public IEnumerable<Trip> GetTripByTrain(long trainID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {Trip.TABLE_NAME} where  {nameof(Trip.TrainID)}=@trainID order by {nameof(Trip.DepTime)}";
                command.Parameters.Add(new NpgsqlParameter("@trainID", trainID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Trip(reader);
                    }
                }
            }
        }
        public Dictionary<long, List<Trip>> GetTrainTripByRoute(long routeID)
        {
            var result=new Dictionary<long,List<Trip>>();
            using (var command = conn.CreateCommand())
            {
                command.CommandText = 
                    $"select {Trip.TABLE_NAME}.* from {Trip.TABLE_NAME} " +
                    $"left join {Trip.TABLE_NAME} as B " +
                    $"on {Trip.TABLE_NAME}.{nameof(Trip.TrainID)}=B.{nameof(Trip.TrainID)} and " +
                    $"B.{nameof(Trip.RouteID)}=@routeID " +
                    $"where B.{nameof(Trip.RouteID)}=@routeID " +
                    $"order by {Trip.TABLE_NAME}.{nameof(Trip.DepTime)}";
                command.Parameters.Add(new NpgsqlParameter("@routeID", routeID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var trip = new Trip(reader);
                        if (!result.ContainsKey(trip.TrainID))
                        {
                            result[trip.TrainID] = new List<Trip>();
                        }
                        result[trip.TrainID].Add(trip);
                    }
                }
            }
            return result;

        }
    }
    

}
