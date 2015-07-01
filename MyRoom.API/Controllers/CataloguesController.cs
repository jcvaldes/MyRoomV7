﻿using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using MyRoom.Model;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using System.IO;
using System.Configuration;
using MyRoom.ViewModels;
using MyRoom.API.Infraestructure;
using System.Collections.Generic;
using MyRoom.API.Filters;
using MyRoom.Data.Mappers;

namespace MyRoom.API.Controllers
{
    [RoutePrefix("api/catalogues")]
    public class CataloguesController : ApiController
    {
        CatalogRepository catalogRepository = new CatalogRepository(new MyRoomDbContext());

        // GET: api/Catalogues
        public IHttpActionResult GetCatalogues()
        {
            return Ok(catalogRepository.GetAll());
        }

        [Route("{key}")]
        [HttpGet]
        public string GetCatalogues(int key, [FromUri]bool withproducts, [FromUri]bool activemod, [FromUri]bool activecategory, [FromUri]int hotelId = 0, [FromUri]string userid = "")
        {
            CatalogCreator creator = new CatalogCreator(catalogRepository.Context);
            if (withproducts)
                return creator.CreateWithProducts(catalogRepository.GetStructureComplete(key), activemod, activecategory, hotelId);
            else
                return creator.CreateWithOutProducts(catalogRepository.GetStructureComplete(key), activemod, activecategory, hotelId, userid);

        }

        [Route("catalogbyid/{key}")]
        [HttpGet]
        public string GetCatalogueById(int key)
        {
            return catalogRepository.GetCatalogueById(key);

        }

        // PUT: api/Catalogues
        public async Task<IHttpActionResult> PutCatalogues(Catalog catalog)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await catalogRepository.EditAsync(catalog);
                return Ok("Catalog Updated");
            }
            catch (Exception ex)
            {
                if (!CataloguesExists(catalog.CatalogId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
        }

        //public async Task<IHttpActionResult> GetStructureCatalogues(Catalog catalog)
        //{
        //}

        // POST: api/Catalogues
        public  IHttpActionResult PostCatalogues(Catalog catalog)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                catalogRepository.Insert(catalog);
                int catalogid = catalog.CatalogId;
                if (catalog.Image!="/img/no-image.jpg")
                    catalog.Image = string.Format("{0}/{1}/{2}", ConfigurationManager.AppSettings["UploadImages"], catalogid , catalog.Image);
                catalogRepository.Edit(catalog);
                //this.CreateStructureDirectories(catalogid);
                return Ok(catalogid);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        // POST: api/catalogues/user/1
        [Route("user")]
        [HttpPost]
        public IHttpActionResult PostCataloguesUser(UserCatalogViewModel userCatalogVm)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                UserCatalogRepository relUserCatalogRepo = new UserCatalogRepository(new MyRoomDbContext());
                RelUserCatalogue relUserCatalog  = UserCatalogMapper.CreateModel(userCatalogVm);
                relUserCatalogRepo.InsertUserCatalog(userCatalogVm, true);


                UserModuleRepository relUserModuleRepo = new UserModuleRepository(relUserCatalogRepo.Context);
                List<RelUserModule> userModules = UserModuleMapper.CreateModel(userCatalogVm);
                relUserModuleRepo.InsertUserModule(userModules, userCatalogVm.UserId, true);

                UserCategoryRepository relUserCategoryRepo = new UserCategoryRepository(relUserCatalogRepo.Context);
                List<RelUserCategory> userCategories = UserCategoryMapper.CreateModel(userCatalogVm);
                relUserCategoryRepo.InsertUserCategory(userCategories, userCatalogVm.UserId, true);

                return Ok("Permission Assigned");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void CreateStructureDirectories(int catalogid)
        {

            string uploadFolder = ConfigurationManager.AppSettings["UploadImages"];

            try
            {

                uploadFolder = System.Web.HttpContext.Current.Server.MapPath(uploadFolder);

                if (!Directory.Exists(uploadFolder))
                { 
                    Directory.CreateDirectory(uploadFolder);
                }

             
                uploadFolder = string.Format("{0}\\{1}", uploadFolder, catalogid);
             
                string[] directories = new string[] {
                                uploadFolder  + "\\modules",
                                uploadFolder + "\\categories",
                                uploadFolder + "\\products",
                                uploadFolder + "\\moreinfo"            
                            };
                for (int n = 0; n < directories.Length; n++)
                {
                    Directory.CreateDirectory(directories[n]);
                }
                
            }
            catch (DirectoryNotFoundException ex)
            {
                throw ex;
            }
        }
        // DELETE: api/Catalogues/5
        [Route("{key}")]
        [HttpDelete]
        [HasCatalogChildrenActionFilter]
        public async Task<IHttpActionResult> DeleteCatalogues(int key)
        {
            await catalogRepository.DeleteAsync(key);

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                catalogRepository.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CataloguesExists(int key)
        {
            return catalogRepository.Context.Catalogues.Count(e => e.CatalogId == key) > 0;
        }

        [Route("{catalogid}/products")]
        public List<Product> GetProductsByCatalogId(int catalogid)
        {
            return catalogRepository.GetProductsByCatalog(catalogid);


        }
    }
}
