using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using System.Web.Http;

namespace MyRoom.API.Filters
{
    public class HasCatalogChildrenActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext context)
        {
            CatalogRepository catalogRepository = new CatalogRepository(new MyRoomDbContext());
            bool hasChildrens = catalogRepository.HasCatalogChildrens((int)context.ActionArguments["key"]);
            if (!hasChildrens)
                throw new HttpResponseException(context.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, "Please, delete the modules childrens"));


        }

    }
}