using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using Microsoft.AspNet.Identity;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using MyRoom.Model;

namespace MyRoom.API.Infraestructure
{
    public class UserInformation
    {
        private AccountRepository _genericRepository;
        public MyRoomDbContext Context { get; private set; }
        
        public string IdUser { get; set; }
        public string Rol { get; set; }

        public UserInformation(MyRoomDbContext context)
        {
            this.Context = context;
            _genericRepository = new AccountRepository(context);
        }

        public void InformationUser(string UserName)
        {
            ClaimsPrincipal principal = HttpContext.Current.User as ClaimsPrincipal;
            UserManager<ApplicationUser> manager = _genericRepository.Manager;
            ApplicationUser user = manager.FindByName(UserName);
            var Id = user.Id;
            var claims = principal.Claims.ToList();
            var rol = claims[1].Value;

            IdUser = Id;
            Rol = rol;
        }

    }
}