﻿using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using MyRoom.API.Infraestructure;
using MyRoom.Data;
using MyRoom.Data.Repositories;
using MyRoom.Helpers;
using MyRoom.Model;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyRoom.API.Providers
{
    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {

            string clientId = string.Empty;
            string clientSecret = string.Empty;
            Client client = null;

            if (!context.TryGetBasicCredentials(out clientId, out clientSecret))
            {
                context.TryGetFormCredentials(out clientId, out clientSecret);
            }

            if (context.ClientId == null)
            {
                //Remove the comments from the below line context.SetError, and invalidate context 
                //if you want to force sending clientId/secrects once obtain access tokens. 
                context.Validated();
                //context.SetError("invalid_clientId", "ClientId should be sent.");
                return Task.FromResult<object>(null);
            }

            using (AccountRepository _repo = new AccountRepository(new MyRoomDbContext()))
            {
                client = _repo.FindClient(context.ClientId);
            }

            if (client == null)
            {
                context.SetError("invalid_clientId", string.Format("Client '{0}' is not registered in the system.", context.ClientId));
                return Task.FromResult<object>(null);
            }

            if (client.ApplicationType == ApplicationTypes.NativeConfidential)
            {
                if (string.IsNullOrWhiteSpace(clientSecret))
                {
                    context.SetError("invalid_clientId", "Client secret should be sent.");
                    return Task.FromResult<object>(null);
                }
                else
                {
                    if (client.Secret != Helper.GetHash(clientSecret))
                    {
                        context.SetError("invalid_clientId", "Client secret is invalid.");
                        return Task.FromResult<object>(null);
                    }
                }
            }

            if (!client.Active)
            {
                context.SetError("invalid_clientId", "Client is inactive.");
                return Task.FromResult<object>(null);
            }

            context.OwinContext.Set<string>("as:clientAllowedOrigin", client.AllowedOrigin);
            context.OwinContext.Set<string>("as:clientRefreshTokenLifeTime", client.RefreshTokenLifeTime.ToString());

            context.Validated();
            return Task.FromResult<object>(null);
        }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {

            var allowedOrigin = context.OwinContext.Get<string>("as:clientAllowedOrigin");

            if (allowedOrigin == null) allowedOrigin = "*";

            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { allowedOrigin });
            var IsAdmins = false;
            List<IdentityUserRole> userRoles;
            var rolName = "";
            var idUser = "";
            using (AccountRepository _repo = new AccountRepository(new MyRoomDbContext()))
            {
                
                IdentityUser user = await _repo.FindUser(context.UserName, context.Password);
                idUser = user.Id;
                userRoles = user.Roles.ToList();
                var roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(new MyRoomDbContext()));
                
                foreach (var userRole in userRoles)
                {
                    var role = roleManager.FindById(userRole.RoleId);
                    rolName = role.Name;
                    if (role.Name == "Admins") IsAdmins = true;
                }
                if (user == null)
                {
                    context.SetError("invalid_grant", "The user name or password is incorrect.");
                    return;
                }
            }
            //Buscar las respectivas opciones del usuario para setear las 7 variables de los acceso y enviarlo por el Claim
            PermissionRepository prRepository = new PermissionRepository(new MyRoomDbContext());
            var permisions = prRepository.GetById(idUser).ToList();
            string opcion1 = "",
                opcion2 = "",
                opcion3 = "",
                opcion4 = "",
                opcion5 = "",
                opcion6 = "";
            foreach (var um in permisions)
            {
                if (um.IdPermission.ToString() == "1")
                {
                    opcion1 = "1";
                }
                if (um.IdPermission.ToString() == "2")
                {
                    opcion2 = "2";
                }
                if (um.IdPermission.ToString() == "3")
                {
                    opcion3 = "3";
                }
                if (um.IdPermission.ToString() == "4")
                {
                    opcion4 = "4";
                }
                if (um.IdPermission.ToString() == "5")
                {
                    opcion5 = "5";
                }
                if (um.IdPermission.ToString() == "6")
                {
                    opcion6 = "6";
                }
            }
            var identity = new ClaimsIdentity(context.Options.AuthenticationType);
            identity.AddClaim(new Claim(ClaimTypes.Name, context.UserName));
            identity.AddClaim(new Claim(ClaimTypes.Role, rolName));
            identity.AddClaim(new Claim("role", "user"));
            identity.AddClaim(new Claim("sub", context.UserName));

            var props = new AuthenticationProperties(new Dictionary<string, string>
                {
                    { 
                        "as:client_id", (context.ClientId == null) ? string.Empty : context.ClientId
                    },
                    { 
                        "userName", context.UserName
                    },
                    {
                        "rol", IsAdmins.ToString()
                    },
                    {
                        "opcion1", opcion1
                    },
                    {
                        "opcion2", opcion2
                    },
                    {
                        "opcion3", opcion3
                    },
                    {
                        "opcion4", opcion4
                    },
                    {
                        "opcion5", opcion5
                    },
                    {
                        "opcion6", opcion6
                    }
                });

            var ticket = new AuthenticationTicket(identity, props);
            context.Validated(ticket);

        }

        public override Task GrantRefreshToken(OAuthGrantRefreshTokenContext context)
        {
            var originalClient = context.Ticket.Properties.Dictionary["as:client_id"];
            var currentClient = context.ClientId;

            if (originalClient != currentClient)
            {
                context.SetError("invalid_clientId", "Refresh token is issued to a different clientId.");
                return Task.FromResult<object>(null);
            }

            // Change auth ticket for refresh token requests
            var newIdentity = new ClaimsIdentity(context.Ticket.Identity);

            var newClaim = newIdentity.Claims.Where(c => c.Type == "newClaim").FirstOrDefault();
            if (newClaim != null)
            {
                newIdentity.RemoveClaim(newClaim);
            }
            newIdentity.AddClaim(new Claim("newClaim", "newValue"));

            var newTicket = new AuthenticationTicket(newIdentity, context.Ticket.Properties);
            context.Validated(newTicket);

            return Task.FromResult<object>(null);
        }

        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }

    }
}