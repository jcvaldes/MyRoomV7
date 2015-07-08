using MyRoom.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace MyRoom.Data.Repositories
{
    public class HotelRepository : GenericRepository<Hotel>
    {
        public HotelRepository(MyRoomDbContext context)
            : base(context)
        {
             this.Context = context;
        }

        public string GetHotelsById(int id)
        {
           var hotel = (from c in this.Context.Hotels.Include("Translation")
                             where c.HotelId == id
                             select c).First();

           string json = JsonConvert.SerializeObject(hotel, Formatting.Indented,
                   new JsonSerializerSettings
                   {
                       PreserveReferencesHandling = PreserveReferencesHandling.Objects
                   });
           return json;
        }

        public List<Hotel> GetHotelsByUser(string idUser)
        {
            var userHotel = (from userhotel in Context.UserHotelPermissions select userhotel).ToList();
            var hotelList = (from hotel in this.GetAll() select hotel).ToList();

            var j = (from uh in hotelList
                    join ht in userHotel
                        on uh.HotelId equals ht.IdHotel
                    where ht.IdUser == idUser
                    select uh).ToList();

            return j;
        }

        public override async System.Threading.Tasks.Task EditAsync(Hotel entity)
        {
            this.Context.Entry(entity).State = EntityState.Modified;
            this.Context.Entry(entity.Translation).State = EntityState.Modified;
            await this.Context.SaveChangesAsync();

        }
        public MyRoomDbContext Context { get; private set; }

        public List<ActiveHotelCatalogue> GetHotelCatalogActives(int hotelId)
        {
            return this.Context.HotelCatalogues.Where(c=>c.IdHotel == hotelId && c.Active).ToList();
        }

        public List<ActiveHotelCatalogue> GetHotelCatalogActivesByCatalog(int catalogid)
        {
            return this.Context.HotelCatalogues.Include("Hotel").Where(c => c.IdCatalogue == catalogid && c.Active).ToList();
        }
    }
}