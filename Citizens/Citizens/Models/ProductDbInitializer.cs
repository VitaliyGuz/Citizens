using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity;
using System.IO;
using System.Data.SqlClient;
using System.Data;

namespace Citizens.Models
{
    public class ProductDbInitializer : DropCreateDatabaseAlways<CitizenDbContext>
    {
        protected override void Seed(CitizenDbContext context)
        {

            StoreUserManager userMgr = new StoreUserManager(new UserStore<User>(context));
            StoreRoleManager roleMgr = new StoreRoleManager(new RoleStore<Role>(context));

            string roleName = "Administrators";
            string userName = "Admin";
            string password = "secret";
            string email = "admin@example.com";

            if (!roleMgr.RoleExists(roleName))
            {
                roleMgr.Create(new Role(roleName));
            }
            User userAdmin = userMgr.FindByName(userName);
            if (userAdmin == null)
            {
                userMgr.Create(new User
                {
                    UserName = userName,
                    Email = email
                }, password);
                userAdmin = userMgr.FindByName(userName);
            }
            if (!userMgr.IsInRole(userAdmin.Id, roleName))
            {
                userMgr.AddToRole(userAdmin.Id, roleName);
            }
            base.Seed(context);

            roleName = "Operators";
            userName = "Operator";
            password = "secret";
            email = "operator@example.com";

            if (!roleMgr.RoleExists(roleName))
            {
                roleMgr.Create(new Role(roleName));
            }
            User userOperator = userMgr.FindByName(userName);
            if (userOperator == null)
            {
                userMgr.Create(new User
                {
                    UserName = userName,
                    Email = email
                }, password);
                userOperator = userMgr.FindByName(userName);
            }
            if (!userMgr.IsInRole(userOperator.Id, roleName))
            {
                userMgr.AddToRole(userOperator.Id, roleName);
            }
            base.Seed(context);



            

            new List<Region>
            {
                new Region()
                {
                    Name = "Полтавська обл."
                }
            }.ForEach(region => context.Regions.Add(region));
            context.SaveChanges();


            new List<RegionPart>
            {
                new RegionPart()
                {
                    Name = "Окрябрський",
                    RegionId = 1,
                    RegionPartType = RegionPartType.місто
                },

                new RegionPart()
                {
                    Name = "Ленінський",
                    RegionId = 1,
                    RegionPartType = RegionPartType.місто
                },
                new RegionPart()
                {
                    Name = "Полтавський",
                    RegionId = 1,
                    RegionPartType = RegionPartType.область
                }

                
            }.ForEach(regionPart => context.RegionParts.Add(regionPart));
            context.SaveChanges();


            City poltavaCity = new City()
            {
                Name = "Полтава",
                CityType = new CityType()
                {
                    Name = "м."
                },
                RegionPartId = 3,
                IncludedToRegionPart = false
            };


            new List<City>
            {
                poltavaCity
            }.ForEach(city => context.Cities.Add(city));
            context.SaveChanges();

            new List<Street>
            {
                new Street()
                {
                    Name = "Без вулиці",
                    StreetType = new StreetType()
                    {
                        Name = "Без типу"
                    }
                },
                new Street()
                {
                    Name = "Боровиковського В.",
                    StreetType = new StreetType()
                    {
                        Name = "бул."
                    }
                },
                new Street()
                {
                    Name = "Красіна",
                    StreetType = new StreetType()
                    {
                        Name = "вул."
                    }
                }
            }.ForEach(street => context.Streets.Add(street));
            context.SaveChanges();


            District poltavaDistrict144 = new District()
            {
                Id = 144
            };

            context.Districts.Add(poltavaDistrict144);
            context.SaveChanges();

            new List<Precinct>
            {
                new Precinct()
                {
                    Id = 531188,                    
                    House = "29/16",
                    CityId = 1,
                    StreetId = 1,
                    District = poltavaDistrict144,
                    RegionPartId = 1
                },
                new Precinct()
                {
                    Id = 531189,
                    House = "5",
                    CityId = 1,
                    StreetId = 2,
                    District = poltavaDistrict144,
                    RegionPartId = 2
                }
            }.ForEach(precinct => context.Precincts.Add(precinct));
            context.SaveChanges();

            new List<PrecinctAddress>
            {
                new PrecinctAddress()
                {
                    CityId = 1,
                    StreetId = 2,
                    House = "45",
                    PrecinctId = 531188
                },
                new PrecinctAddress()
                {
                    CityId = 1,
                    StreetId = 2,
                    House = "2б",
                    PrecinctId = 531188
                }
            }.ForEach(precinctAddress => context.PrecinctAddresses.Add(precinctAddress));
            context.SaveChanges();

            new List<Person>
            {
                new Person()
                {
                    FirstName =  "Ольга"
                    ,
                    MidleName = "Анатоліївна"
                    ,
                    LastName = "Лещенко"
                    ,
                    DateOfBirth = DateTime.Parse("01/08/38"),
                    Gender = Gender.ж,
                    City = poltavaCity,
                    StreetId = 2,
                    House = "45",
                    Apartment = 10
                },
                new Person()
                {
                    FirstName = "Віталій"
                    ,
                    MidleName = "Васильович"
                    ,
                    LastName = "Хоменко"
                    ,
                    DateOfBirth = DateTime.Parse("02/09/41"),
                    Gender = Gender.ч,
                    City = poltavaCity,
                    StreetId = 2,
                    House = "2б"
                }
            }.ForEach(person => context.People.Add(person));
            context.SaveChanges();




            

            new List<CityRegionPart>
            {
                new CityRegionPart()
                {
                    CityId = 1,
                    RegionPartId = 1                    
                },

                new CityRegionPart()
                {
                    CityId = 1,
                    RegionPartId = 2                    
                }
            }.ForEach(cityRegionPart => context.CityRegionParts.Add(cityRegionPart));
            context.SaveChanges();



            new List<PrecinctAddress>
            {
                new PrecinctAddress
                {
                    CityId = 1,
                    Street = new Street
                    {
                        Name = "Інститутський проріз",
                        StreetTypeId = 3
                    },
                    House = "34",
                    PrecinctId = 531188
                },
                new  PrecinctAddress
                {
                    CityId = 1,
                    Street = new Street
                    {
                        Name = "Пролетарська",
                        StreetTypeId = 3
                    },
                    House = "1А",
                    PrecinctId = 531188
                }
            }.ForEach(precinctAddress => context.PrecinctAddresses.Add(precinctAddress));
            context.SaveChanges();

            new List<UserPrecinct>
            {
                new UserPrecinct
                {
                    UserId = userOperator.Id,
                    PrecinctId = 531188
                },
                new UserPrecinct
                {
                    UserId = userAdmin.Id,
                    PrecinctId = 531189
                }
            }.ForEach(userPrecinct => context.UserPrecincts.Add(userPrecinct));
            context.SaveChanges();


            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["CitizensDb"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string path1 = HttpContext.Current.Server.MapPath("~/Scripts/Sql/createPersonType.sql");
                FileInfo file = new FileInfo(path1);
                string sqlInsert = file.OpenText().ReadToEnd();
                SqlCommand insertCommand = new SqlCommand(sqlInsert, connection);

                // Execute the command.
                connection.Open();
                insertCommand.CommandTimeout = 0;
                insertCommand.ExecuteNonQuery();
            }

        }
    }
}