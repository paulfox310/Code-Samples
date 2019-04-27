using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Models;
using Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Web.Core.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class EntityAuthAttribute : BaseAuthActionFilter
    {
        public IIdentityProvider<int> IdentityProvider { get; set; }
        public ISecureEntities<int, int> ISecureEntities { get; set; }

        public EntityAuthAttribute()
        {
        }

        public override Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
			//this is not ideal and needs to come in through DI
            IdentityProvider = context.HttpContext.RequestServices.GetService(typeof(IIdentityProvider<int>)) as IIdentityProvider<int>;
            ISecureEntities = context.HttpContext.RequestServices.GetService(typeof(ISecureEntities<int, int>)) as ISecureEntities<int, int>;

            if (context != null && context.ActionArguments != null && context.ActionArguments.Count > 0)
            {
                if (!ValidateArguments(context.ActionArguments))
                {
                    HandleUnauthorizedRequest(context);
                    return Task.CompletedTask;
                }
            }

            return next();
        }

        private void HandleUnauthorizedRequest(ActionExecutingContext actionContext)
        {
            var unAthuorized = new UnauthorizedResult();
            actionContext.Result = unAthuorized;
        }

        private bool ValidateArguments(IDictionary<string, object> actionArguments)
        {
            int? id = null;
            int userId = this.IdentityProvider.GetCurrentUserId();

            id = GetEntityId(actionArguments);

            if (id.HasValue)
            {
                return this.ISecureEntities.IsAuthorized(userId, id.Value, this.Action, this.EntityTypeId);
            }
            else
            {
                return false;
            }
        }

        public virtual int? GetEntityId(IDictionary<string, object> actionArguments)
        {
            int? id = null;
            int parseId = 0;
            IModelIdentifier requestModel = null;
            string idField = this.EntityIdField ?? "id";
            ISelectModelIdentifier updateModel = null;

            if (actionArguments.ContainsKey("model"))
            {
                updateModel = actionArguments["model"] as ISelectModelIdentifier;
                if (updateModel != null)
                {
                    updateModel = actionArguments["model"] as ISelectModelIdentifier;
                    return updateModel.SelectId;
                }

                requestModel = actionArguments["model"] as IModelIdentifier;
                if (requestModel != null)
                {
                    id = requestModel.Id;
                }
            }
            else if (actionArguments.ContainsKey(idField))
            {
                if (actionArguments.ContainsKey(idField) && int.TryParse(actionArguments[idField].ToString(), out parseId))
                {
                    id = parseId;
                }
            }

            return id;
        }
    }
}