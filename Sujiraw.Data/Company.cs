using Microsoft.Data.Sqlite;
using Npgsql;
using Sujiro.Data.Common;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Data.Common;
using static System.Net.Mime.MediaTypeNames;


namespace Sujiro.Data
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

    [Table(TABLE_NAME)]
    public class Company : BaseTable
    {
        public const string TABLE_NAME = "company";

        public long CompanyID { get; set; }
        public string Name { get; set; } = "";
        public string UserID { get; set; } = "";

        public Company()
        {
            CompanyID = MyRandom.NextSafeLong();
        }

        public Company(DbDataReader reader)
        {
            CompanyID = reader.GetInt64(nameof(CompanyID));
            Name = reader.GetString(nameof(Name));
            UserID = (string)reader[nameof(UserID)];
        }

        static public Company? GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(CompanyID)}=@{nameof(CompanyID)}";
                command.Parameters.Add(new SqliteParameter(nameof(CompanyID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new Company(reader);
                    }
                }
                return null;
            }
        }
        static public void Insert(DbConnection conn, List<Company> insertItems)
        {
            using (var command = conn.CreateCommand())
            {

                command.CommandText = $"INSERT INTO {TABLE_NAME} ({nameof(CompanyID)},{nameof(Name)},{nameof(UserID)}) " +
                    $"values (@{nameof(CompanyID)},@{nameof(Name)},@{nameof(UserID)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(Name)} = EXCLUDED.{nameof(Name)},{nameof(UserID)} = EXCLUDED.{nameof(UserID)}";

                command.Parameters.Add(CreateParameter(command, nameof(CompanyID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Name), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(UserID), DbType.String));

                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(CompanyID)].Value = item.CompanyID;
                    command.Parameters[nameof(Name)].Value = item.Name;
                    command.Parameters[nameof(UserID)].Value = item.UserID;
                    command.ExecuteNonQuery();
                }
            }
        }
        static public IEnumerable<Company> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new Company(reader);
                    }
                }
            }
        }
    }

    partial class PostgresDbService
    {
        public List<Company> GetAllCompany()
        {
            return Company.GetAll(this.conn).ToList();
        }
        public Company? GetCompany(long companyID)
        {
            return Company.GetByID(this.conn, companyID);
        }
        public void InsertCompany(List<Company> companies)
        {
            Company.Insert(this.conn, companies);
        }
    }

}
