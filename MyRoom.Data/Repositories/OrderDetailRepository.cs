using MyRoom.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MyRoom.Data.Repositories
{
    public class OrderDetailRepository : GenericRepository<OrderDetail>
    {
        public MyRoomDbContext Context { get; private set; }
        public OrderDetailRepository(MyRoomDbContext context)
            : base(context)
        {
            this.Context = context;
        }

        public bool HasOrderDetail(int productId)
        {
            return (from p in this.Context.OrderDetails
                    where p.ProductId == productId
                    select p).Count() > 0;
        }

    }
}