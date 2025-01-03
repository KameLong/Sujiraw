﻿
using Sujiraw.Data.Common;
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
    public class Train : BaseTable
    {
        public static readonly string TABLE_NAME = "Train";

        public long TrainID { get; set; }
        public long CompanyID { get; set; }

        public long DepStationID { get; set; }
        public long AriStationID { get; set; }
        public int DepTime { get; set; }
        public int AriTime { get; set; }

        public Train(long companyID)
        {
            TrainID = MyRandom.NextSafeLong();
            CompanyID = companyID;
        }
        public Train(DbDataReader reader)
        {
            TrainID = reader.GetInt64(nameof(TrainID));
            CompanyID = reader.GetInt64(nameof(CompanyID));
            DepStationID = reader.GetInt64(nameof(DepStationID));
            AriStationID = reader.GetInt64(nameof(AriStationID));
            DepTime = reader.GetInt32(nameof(DepTime));
            AriTime = reader.GetInt32(nameof(AriTime));

        }

        static public Train GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(TrainID)}=@{nameof(TrainID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(TrainID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new Train(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public void Insert(DbConnection conn, List<Train> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(TrainID)},{nameof(CompanyID)},{nameof(DepStationID)},{nameof(AriStationID)},{nameof(DepTime)},{nameof(AriTime)}) " +
                    $"values (@{nameof(TrainID)},@{nameof(CompanyID)},@{nameof(DepStationID)},@{nameof(AriStationID)},@{nameof(DepTime)},@{nameof(AriTime)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(DepStationID)} = EXCLUDED.{nameof(DepStationID)},{nameof(AriStationID)} = EXCLUDED.{nameof(AriStationID)},{nameof(DepTime)} = EXCLUDED.{nameof(DepTime)},{nameof(AriTime)} = EXCLUDED.{nameof(AriTime)}";

                command.Parameters.Add(CreateParameter(command, nameof(TrainID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(CompanyID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(DepStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(AriStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(DepTime), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(AriTime), DbType.Int32));

                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(TrainID)].Value = item.TrainID;
                    command.Parameters[nameof(CompanyID)].Value = item.CompanyID;
                    command.Parameters[nameof(DepStationID)].Value = item.DepStationID;
                    command.Parameters[nameof(AriStationID)].Value = item.AriStationID;
                    command.Parameters[nameof(DepTime)].Value = item.DepTime;
                    command.Parameters[nameof(AriTime)].Value = item.AriTime;

                    command.ExecuteNonQuery();
                }
            }
        }
        static public IEnumerable<Train> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Train(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<Train> GetAllTrain()
        {
            return Train.GetAll(this.conn).ToList();
        }
        public Train GetTrain(long stationID)
        {
            return Train.GetByID(this.conn, stationID);
        }
        public void InsertTrain(List<Train> stations)
        {
            Train.Insert(this.conn, stations);
        }
        public IEnumerable<Train> GetTrainByRoute(long companyID, long routeID)
        {
            using (var command = conn.CreateCommand())
            {
                //まず、routeIDに含まれるTripを取得し、そのTripに含まれるTrainを取得する

                command.CommandText = $"select DISTINCT {Train.TABLE_NAME}.* from {Trip.TABLE_NAME} left join {Train.TABLE_NAME} " +
                    $"on {Trip.TABLE_NAME}.{nameof(Trip.TrainID)}={Train.TABLE_NAME}.{nameof(Train.TrainID)} where {nameof(Trip.RouteID)}=@routeID";
                command.Parameters.Add(new NpgsqlParameter("routeID", routeID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Train(reader);
                    }
                }

            }
        }
        public IEnumerable<Train> GetTrainByCompany(long companyID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {Train.TABLE_NAME} where {nameof(Train.CompanyID)} = @{nameof(Train.CompanyID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(Train.CompanyID), companyID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Train(reader);
                    }
                }
            }
        }
    }

}
