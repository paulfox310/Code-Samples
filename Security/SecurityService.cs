using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace Services.Security
{
    public class SecurityService : ISecureEntities<int, int>
    {
        private IDataProvider _dataProvider;
        private IAuthenticationService<int> _auth;

        public SecurityService(IDataProvider dataProvider, IAuthenticationService<int> auth)
        {
            _dataProvider = dataProvider;
            _auth = auth;
        }

        public bool IsAuthorized(int userId, int entityId, EntityActionType actionType, EntityType entityType)
        {
            IUserAuthData user = _auth.GetCurrentUser();
            IEnumerable<string> roles = user.Roles;
            bool? isAdmin = roles?.Contains("SysAdmin");

            if (isAdmin.HasValue && isAdmin.Value)
            {
                return true;
            }

            bool hasAccess = false;
            string proc = "dbo.Security_" + entityType + "_Can" + actionType;
            _dataProvider.ExecuteNonQuery
                (
                proc,
                inputParamMapper: delegate (SqlParameterCollection paramCol)
                {
                    SqlParameter p = new SqlParameter();
                    p.ParameterName = "@HasAccess";
                    p.SqlDbType = SqlDbType.Bit;
                    p.Direction = ParameterDirection.Output;
                    paramCol.Add(p);

                    paramCol.AddWithValue("@userId", userId);
                    paramCol.AddWithValue("@EntityId", entityId);
                },
                returnParameters: delegate (SqlParameterCollection paramCol)
                {
                    Boolean.TryParse(paramCol["@HasAccess"].Value.ToString(), out hasAccess);
                }
                );

            return hasAccess;
        }
    }
}