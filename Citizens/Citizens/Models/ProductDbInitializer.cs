﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity;
using System.IO;
using System.Data.SqlClient;
using System.Data;
using Microsoft.AspNet.Identity.Owin;

namespace Citizens.Models
{
    public class ProductDbInitializer : CreateDatabaseIfNotExists<CitizenDbContext>
    {
        protected override void Seed(CitizenDbContext context)
        {
            
            var userMgr = HttpContext.Current
                .GetOwinContext().GetUserManager<ApplicationUserManager>();

            var roleMgr = HttpContext.Current
                .GetOwinContext().Get<ApplicationRoleManager>();

            string roleName = "Administrators";
            string userName = "Admin";
            string password = "secret";
            string email = "admin@example.com";

            if (!roleMgr.RoleExists(roleName))
            {
                roleMgr.Create(new ApplicationRole(roleName));
            }
            ApplicationUser userAdmin = userMgr.FindByName(userName);
            if (userAdmin == null)
            {
                userMgr.Create(new ApplicationUser
                {
                    UserName = userName,
                    Email = email,
                    FirstName = userName
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
                roleMgr.Create(new ApplicationRole(roleName));
            }
            ApplicationUser userOperator = userMgr.FindByName(userName);
            if (userOperator == null)
            {
                userMgr.Create(new ApplicationUser
                {
                    UserName = userName,
                    Email = email,
                    FirstName = userName
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
                    //District = poltavaDistrict144,
                    RegionPartId = 1,
                    lat = 49.5880818,
                    lng = 34.5539573,
                    location_type = "ROOFTOP"
                },
                new Precinct()
                {
                    Id = 531189,
                    House = "5",
                    CityId = 1,
                    StreetId = 2,
                    //District = poltavaDistrict144,
                    RegionPartId = 2,
                    lat = 49.6880818,
                    lng = 34.6539573,
                    location_type = "ROOFTOP"
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

            new List<PropertyKey>
            {
                new PropertyKey
                {
                    Name = "Серія паспорту",
                    PropertyType = PropertyType.Рядок
                },
                new PropertyKey
                {
                    Name = "Національність",
                    PropertyType = PropertyType.Довідник
                },
                new PropertyKey
                {
                    Name = "Номер Паспорту",
                    PropertyType = PropertyType.Число
                },
                new PropertyKey
                {
                    Name = "Дата видачі паспорту",
                    PropertyType = PropertyType.Дата
                },
                new PropertyKey
                {
                    Name = "Місто проживання",
                    PropertyType = PropertyType.Місто
                },
                new PropertyKey
                {
                    Name = "Вулиця проживання",
                    PropertyType = PropertyType.Вулиця
                }
            }.ForEach(propertyKey => context.PropertyKeys.Add(propertyKey));
            context.SaveChanges();

            new List<PropertyValue>
            {
                new PropertyValue
                {
                    PropertyKeyId = 2,
                    Value = "України"                    
                },
                new PropertyValue
                {
                    PropertyKeyId = 2,
                    Value = "Росії"                    
                }
            }.ForEach(propertyValue => context.PropertyValues.Add(propertyValue));
            context.SaveChanges();

            new List<PersonAdditionalProperty>
            {
                new PersonAdditionalProperty
                {
                    PersonId = 1,
                    PropertyKeyId = 1,
                    StringValue = "КО"
                },
                new PersonAdditionalProperty
                {
                    PersonId = 1,
                    PropertyKeyId = 2,
                    PropertyValueId = 1
                },
                new PersonAdditionalProperty
                {
                    PersonId = 1,
                    PropertyKeyId = 3,
                    IntValue = 334214
                },
                new PersonAdditionalProperty
                {
                    PersonId = 1,
                    PropertyKeyId = 4,
                    DateTimeValue = DateTime.Parse("12/01/2001")                    
                },
                new PersonAdditionalProperty
                {
                    PersonId = 1,
                    PropertyKeyId = 5,
                    IntValue = 1                    
                },
                new PersonAdditionalProperty
                {
                    PersonId = 1,
                    PropertyKeyId = 6,
                    IntValue = 1
                },
                new PersonAdditionalProperty
                {
                    PersonId = 2,
                    PropertyKeyId = 2,
                    PropertyValueId = 2
                }
            }.ForEach(personAdditionalProperty => context.PersonAdditionalProperties.Add(personAdditionalProperty));
            context.SaveChanges();

            //string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["CitizensDb"].ConnectionString;
            //using (SqlConnection connection = new SqlConnection(connectionString))
            //{
            //    string path1 = HttpContext.Current.Server.MapPath("~/Scripts/Sql/createPersonType.sql");
            //    FileInfo file = new FileInfo(path1);
            //    string sqlInsert = file.OpenText().ReadToEnd();
            //    SqlCommand insertCommand = new SqlCommand(sqlInsert, connection);

            //    // Execute the command.
            //    connection.Open();
            //    insertCommand.CommandTimeout = 0;
            //    insertCommand.ExecuteNonQuery();
            //}

        }
    }
}