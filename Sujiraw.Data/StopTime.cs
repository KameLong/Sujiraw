
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
using System.ComponentModel.DataAnnotations.Schema;

namespace Sujiraw.Data
{
    abstract public class BaseTable
    {
        static public DbParameter CreateParameter(DbCommand command, string name, DbType type)
        {
            var param = command.CreateParameter();
            param.ParameterName = name;
            param.DbType = type;
            return param;
        }
    }
    public class StopTime : BaseTable
    {
        public static readonly string TABLE_NAME = "StopTime";

        public long TripID { get; set; }

    }

}
