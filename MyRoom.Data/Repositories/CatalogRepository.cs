using MyRoom.Helpers;
using MyRoom.Model;
using MyRoom.Model.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace MyRoom.Data.Repositories
{
    public class CatalogRepository : GenericRepository<Catalog>
    {
        public CatalogRepository(MyRoomDbContext context)
            : base(context)
        {
            this.Context = context;
        }

        public Catalog GetStructureComplete(int id)
        {
            var catalogues = from c in this.Context.Catalogues
                                 .Include("Translation")
                                 .Include("Modules")
                                 .Include("Modules.Translation")
                                 .Include("Modules.ActiveHotelModule")
                                 .Include("Modules.Categories")
                                 .Include("Modules.Categories.Translation")
                                 .Include("Modules.Categories.TranslationDescription")
                                 .Include("Modules.Categories.CategoryProducts")
                                 .Include("Modules.Categories.ActiveHotelCategory")
                                 .Include("Modules.RelUserModule")
                             where c.CatalogId == id && c.Active == true
                             select c;
            return catalogues.FirstOrDefault();
         
        }

        public override async Task EditAsync(Catalog entity)
        {
            this.Context.Entry(entity).State = EntityState.Modified;
            this.Context.Entry(entity.Translation).State = EntityState.Modified;

            await this.Context.SaveChangesAsync();
        }

        public MyRoomDbContext Context { get; private set; }


        public List<Catalog> GetCatalogByUser(string idUser)
        {
            var userCatalog = (from usercatalog in Context.RelUserCatalogue select usercatalog);
            var catalogList = (from cataloglist in this.GetAll() .Include("Translation") select cataloglist);

            var j = (from uc in catalogList
                     join ct in userCatalog
                         on uc.CatalogId equals ct.IdCatalogue
                     where ct.IdUser == idUser
                     select uc);

            return j.ToList();
        }

        public string GetCatalogueById(int key)
        {
            var catalogues = from c in this.Context.Catalogues
                               .Include("Translation")

                             where c.CatalogId == key
                             select c;
            return JsonConvert.SerializeObject(catalogues.First(), Formatting.Indented,
                    new JsonSerializerSettings
                    {
                        PreserveReferencesHandling = PreserveReferencesHandling.Objects
                    });
        }

        public bool HasCatalogChildrens(int catalogId)
        {
            var modules = (from c in this.Context.Catalogues.Where(e=>e.CatalogId == catalogId && e.Active)
                select c.Modules).FirstOrDefault();

            return modules.Count() == 0;
        }

        public List<Product> GetProductsByCatalog(int catalogId)
        {


            List<Product> products = new List<Product>();
            var modules = (
                    from m in this.Context.Catalogues.Where(e => e.CatalogId == catalogId && e.Active)
                    select  m.Modules).ToList();
                              

            return products;

        }
    }
}