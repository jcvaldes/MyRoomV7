using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using System.Web.Http;

namespace MyRoom.API.Filters
{
    public class HasProductsOrderDetailActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext context)
        {
            OrderDetailRepository orderDetail = new OrderDetailRepository(new MyRoomDbContext());
            bool hasOrders = orderDetail.HasOrderDetail((int)context.ActionArguments["key"]);
            if (hasOrders)
                throw new HttpResponseException(context.Request.CreateErrorResponse(HttpStatusCode.NotAcceptable, "The Product has Orders Details"));


        }

    }
}