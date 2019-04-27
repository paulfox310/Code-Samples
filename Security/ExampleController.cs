using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models;
using Models.Domain;
using Models.Requests;
using Services;
using Web.Controllers;
using Web.Core.Filters;
using Web.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Web.Api.Controllers
{
    [Route("api/example")]
    [ApiController]
    public class ExampleController : BaseApiController
    {
        private IABCPermitsService _abcPermits;

        public ExampleController(ILogger<TestController> logger, IABCPermitsService abcPermits) : base(logger)
        {
            _abcPermits = abcPermits;
        }

        [HttpGet("abcpermits/{id:int}")]
        [EntityAuth(Action = Models.EntityActionType.Read, EntityTypeId = Models.EntityType.ABCPermits)]
        public ActionResult<ItemResponse<ABCPermit>> Select(int id)
        {
            ActionResult result = null;
            try
            {
                ABCPermit model = _abcPermits.Select(id);
                if (model == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    ItemResponse<ABCPermit> response = new ItemResponse<ABCPermit>();
                    response.Item = model;
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message));
            }
            return result;
        }

        [HttpPut("abcpermits/{id:int}")]
        [EntityAuth(Action = Models.EntityActionType.Write, EntityTypeId = Models.EntityType.ABCPermits)]
        public ActionResult<SuccessResponse> Put(ABCPermitUpdateRequest model, int id)
        {
            ActionResult result = null;
            try
            {
                _abcPermits.Update(model);
                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message));
            }
            return result;
        }
    }
}