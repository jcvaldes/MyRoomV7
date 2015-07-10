using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using MyRoom.API.Filters;
using MyRoom.Model;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using MyRoom.Model.ViewModels;
using MyRoom.Data.Mappers;

namespace MyRoom.API.Controllers
{
    [Authorize]
    [RoutePrefix("api/products")]
    public class ProductsController : ApiController
    {
        ProductRepository productRepository = new ProductRepository(new MyRoomDbContext());

        // GET: api/Products
        public IQueryable<Product> GetProducts()
        {
            return productRepository.GetAll().OrderBy(p => p.Name);
        }

        // GET: api/Products/5
        [Route("{key}")]
        [HttpGet]
        public string GetProducts(int key)
        {
            return productRepository.GetProductById(key);
        }

        // GET: odata/Products(5
        //[EnableQuery(PageSize = 10, AllowedQueryOptions = AllowedQueryOptions.All)]
        //public SingleResult<Product> GetProducts([FromODataUri] int key)
        //{
        //    //return SingleResult.Create(db.Products.Where(products => products.Id == key));
        //}

        // PUT: api/Products
        [Authorize(Roles = "Admins")]
        public async Task<IHttpActionResult> PutProducts(Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                ProductViewModel prodVm = new ProductViewModel();
                prodVm.RelatedProducts = product.RelatedProducts;

                product.RelatedProducts = null;
                await productRepository.EditAsync(product);

                RelatedProductRepository relprod = new RelatedProductRepository(new MyRoomDbContext());

                relprod.DeleteProductRealted(product.Id);
                if (prodVm.RelatedProducts.Count() > 0)
                    relprod.InsertRelatedProducts(prodVm.RelatedProducts.ToList());
            }
            catch (Exception ex)
            {
                if (!ProductExists(product.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw ex;
                }
            }

            return Ok("Product Updated");
        }

        private bool ProductExists(int key)
        {
            return productRepository.Context.Products.Count(e => e.Id == key) > 0;
        }

        // POST: api/Products
        [Authorize(Roles = "Admins")]
        public IHttpActionResult PostProducts(ProductViewModel productViewModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                Product product = ProductMapper.CreateModel(productViewModel);
                productRepository.Insert(product);

                product.RelatedProducts = new List<RelatedProduct>();
                RelatedProductRepository relProdRepo = new RelatedProductRepository(new MyRoomDbContext());
                foreach (RelatedProduct rp in productViewModel.RelatedProducts)
                {
                    rp.IdProduct = product.Id;
                }
                relProdRepo.InsertRelatedProducts(productViewModel.RelatedProducts.ToList());

                //Inserta productos a ActiveHotelProduct
                ActiveHotelCatalogRepository hotelActiveRepo = new ActiveHotelCatalogRepository(relProdRepo.Context);
                //int hotelId = hotelActiveRepo.GetByCatalogId(productViewModel.CatalogId);
                
//                if (hotelId > 0)
  //              {
                    ActiveHotelProductRepository productHotelActiveRepo = new ActiveHotelProductRepository(relProdRepo.Context);
                    productHotelActiveRepo.Insert(new ActiveHotelProduct() { IdHotel = productViewModel.HotelId, IdProduct = product.Id, Active = true });
    //            }
                return Ok("Product Inserted");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        // PATCH: odata/Products(5)
        //[AcceptVerbs("PATCH", "MERGE")]
        //public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Product> patch)
        //{
        //    Validate(patch.GetEntity());

        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    Product product = await _genericRepository.GetByIdAsync(key);
        //    if (product == null)
        //    {
        //        return NotFound();
        //    }

        //    patch.Patch(product);

        //    try
        //    {
        //        await db.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!ProductsExists(key))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Updated(product);
        //}

        // DELETE: api/Products/5
        [Authorize(Roles = "Admins")]
        [Route("{key}")]
        [HttpDelete]
        [HasProductsOrderDetailActionFilter]
        public async Task<IHttpActionResult> DeleteProducts(int key)
        {
         
            try
            {
                await productRepository.DeleteAsync(key);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return StatusCode(HttpStatusCode.NoContent);
        }

     
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                productRepository.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
