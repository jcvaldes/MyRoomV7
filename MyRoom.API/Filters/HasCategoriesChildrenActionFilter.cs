using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using MyRoom.Model;
using System.Web.Http;

namespace MyRoom.API.Filters
{
    public class HasCategoriesChildrenActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext context)
        {
            CategoryRepository categoryRepository = new CategoryRepository(new MyRoomDbContext());
            List<Category> categories = categoryRepository.GetByParentId((int)context.ActionArguments["key"]);
            if (categories.Count > 0)
                throw new HttpResponseException(context.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, "Please, delete the categories children"));


        }

    }
}