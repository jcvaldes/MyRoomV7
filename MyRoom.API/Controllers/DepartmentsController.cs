using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using MyRoom.Model;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using MyRoom.ViewModels;
using MyRoom.Data.Mappers;

namespace MyRoom.API.Controllers
{
    [Authorize]
    [RoutePrefix("api/departments")]
    public class DepartmentsController : ApiController
    {
        DepartmentRepository departmentRepository = new DepartmentRepository(new MyRoomDbContext());

        // GET: api/departments
        public IHttpActionResult GetDepartment()
        {
            return Ok(departmentRepository.GetAll());
        }

        // GET: api/departments/5
        [Route("{key}")]
        [HttpGet]
        public IHttpActionResult GetDepartment(int key)
        {
            return Ok(departmentRepository.GetById  (key));
        }


        [Route("hotels/{hotelId}")]
        [HttpGet]
        // GET: api/Departments/hotels/1
        public IHttpActionResult GetDepartmentsByHotel(int hotelId)
        {
            List<Department> deparments = departmentRepository.GetDeparmentByHotelId(hotelId);

            return Ok(deparments);

        }

        [Route("products/{deparmentId}")]
        [HttpGet]
        // GET: api/Departments/products/1
        public IHttpActionResult GetProductsByDeparment(int deparmentId)
        {
            List<Product> products = departmentRepository.GetProductsByDeparmentlId(deparmentId);

            return Ok(products);

        }

        // PUT: api/department
        [Authorize(Roles = "Admins")]
        public async Task<IHttpActionResult> PutDepartments(Department department)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
        
            try
            {
                await departmentRepository.EditAsync(department);
            }
            catch (Exception ex)
            {
                if (!DepartmentExists(department.DepartmentId))
                {
                    return NotFound();
                }
                else
                {
                    throw ex;
                }
            }

            return Ok(department);
        }

        // POST: api/hotels/
        [Authorize(Roles = "Admins")]
        public async Task<IHttpActionResult> PostDepartment(Department department)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await departmentRepository.InsertAsync(department);

            return Ok("The department has been inserted");
        }
        
      
        // DELETE: api/department/5
        [Authorize(Roles = "Admins")]
        [Route("{key}")]
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteDepartment(int key)
        {
            Department department = await departmentRepository.GetByIdAsync(key);
            if (department == null)
            {
                return NotFound();
            }

            await departmentRepository.DeleteAsync(department);

            return StatusCode(HttpStatusCode.NoContent);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                departmentRepository.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DepartmentExists(int key)
        {
            return departmentRepository.Context.Departments.Count(e => e.DepartmentId == key) > 0;
        }
    }
}
