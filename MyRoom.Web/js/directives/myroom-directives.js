﻿/// <reference path="../../tpl/partials/user-form.html" />
(function () {
      //listbox de usuarios
      app.directive('userSelect', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/user-select.html',
              controller: function ($scope, accountService, $state) {
                  $scope.clear = function () {
                      $scope.person.selected = undefined;
                  };
                  
                  $scope.selectActionUser = function (id) {
                      $scope.IdUser = id;
                      if ($state.current.name == 'app.page.userhotel') {
                          for (i = 0; i < $scope.hotels.length; i++)
                              $scope.hotels[i].checked = false;

                          accountService.getUserHotelPermissions(id).then(function (response) {
                              $scope.permissions = response.data;
                             
                              for (i = 0; i < $scope.permissions.length; i++)
                                  $scope.hotels[$scope.permissions[i].IdHotel-1].checked = true;
                          });
                          //$("input[name='post[]']").prop('checked', '')
                          //accountService.getHotelUserId(id).then(function (response) {
                          //    $scope.HotelUser = response.data.value;
                          //    $scope.selectHotelUser = [$scope.HotelUser.length];
                          //    angular.forEach($scope.HotelUser, function (value, key) {
                          //        angular.forEach($scope.hotels, function (valuehotel, keyhotel) {
                          //            if (value.IdHotel == valuehotel.Id) {
                          //                $scope.selectHotelUser[key] = {Id: value.Id, IdHotel: valuehotel.Id};
                          //                $("input[name='post[]']").eq(keyhotel).prop('checked', 'checked')

                          //            }
                          //        })
                          //    });
                          //});
                      }
                      if ($state.current.name == 'app.page.usermenuaccess') {
                          // $("input[name='post[]']").prop('checked', '');
                          for (i = 0; i < $scope.menus.length; i++)
                              $scope.menus[i].checked = false;

                          accountService.getUserPermissions(id).then(function (response) {
                              $scope.permissions = response.data;
                             
                              for (i = 0; i < $scope.permissions.length; i++)
                                  $scope.menus[$scope.permissions[i].IdPermission-1].checked = true;
                          });
                      }
                      
                      if ($state.current.name == 'app.page.usercatalog') {
                          //Buscar el catalogo asignado al usuario
                          accountService.getCatalogUserId(id).then(function (response) {
                              $scope.catalogUser = response.data.value;
                              $scope.activeCheckbox = true;
                              accountService.getModuleUserId(id).then(function (response) {
                                  $scope.loadTreeCatalog($scope.catalogUser[0].IdCatalogue);
                                  $scope.moduleUser = response.data.value;
                                  
                                  angular.forEach($scope.moduleUser, function (value, key) {
                                      angular.forEach($scope.items, function (valueitem, keyitem) {
                                          if (value.IdModule == valueitem.Id) {
                                              //Aca activamos el check
                                              $("input[name='post[]']").eq(keyProducts).prop('checked', 'checked')
                                          }
                                      });
                                  });
                              });
                          });
 
                      };
                  }

                  $scope.person = {};
                  accountService.getAll().then(function (response) {
                      $scope.person = response.data;

                      $scope.users = [$scope.person.length]
                      angular.forEach($scope.person, function (value, key) {
                          $scope.users[key] = {id: value.Id, name: value.Name, email: value.Email, active: value.Active, surname: value.Surname};
                      });  
                  },
                  function (err) {
                    $scope.error_description = err.error_description;
                  });
              }
          };
      })
      //listbox de catalogos
      app.directive('catalogSelect', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/catalog-select.html',
              controller: function ($scope, catalogService, $state) {
                  $scope.selectActionCatalog = function (cata) {
                      if (cata == 0) {
                          $scope.cata.selected = undefined;
                          return;
                      }
                      $scope.showSave = false;
                      $scope.activeCatalog = false;
                      $scope.typeAction = 'module';
                      $scope.IdCatalog = cata.id;
                      $scope.NameCatalog = cata.Name;
                       
                      if ($scope.onCatalogChange)
                          $scope.onCatalogChange(cata.id);


                      if ($state.current.name === 'app.page.usercatalog') {
                          $scope.activeCheckbox = true;
                      }
                      if ($state.current.name !== 'app.page.product_list') {
                          $scope.loadTreeCatalog(cata.id);
                      }

                    //if ($state.current.name == 'app.page.catalogue_assignProducts') {
                    //    for (var i = 0; i < $scope.products.length; i++) {
                    //        $scope.products[i].checked = false;
                    //    }
                    //}

                      
                  }

                  $scope.clear = function () {
                      $scope.catalog.selected = undefined;
                  };
                  $scope.loadCatalog = function () {
                      catalogService.getAll().then(function (response) {
                          $scope.cata = response.data;
                          $scope.catalogues = [$scope.cata.length];
                          angular.forEach($scope.cata, function (value, key) {
                              $scope.catalogues[key] = { id: value.CatalogId, Name: value.Name, Active: value.Active, Pending: value.Pending, Image: value.Image };
                          });
                      },
                      function (err) {
                          $scope.error_description = err.error_description;
                      });
                  }

                  $scope.loadCatalog();


              }
          };
      })
      app.directive('hotelcatalogfilterSelect', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/hotel-select.html',
              scope: {
                  dependends: '@dependends',
                  catalogid: '@catalogid'
              },
              controller: function ($scope, hotelService, $filter) {
                  angular.element(document).ready(function () {
                
                      if ($scope.dependends) {
                          $scope.selectActionHotel = function() {
                              hotelService.getProductsActivated($scope.hotel.selected.Id).then(function (response) {
                                $scope.$parent.products = response.data;
                            });
                          }
                          $scope.$watch('catalogid', function () {
                              if($scope.$parent.cata !== undefined) {

                                  hotelService.getHotelsByCatalogId($scope.$parent.cata.selected.id).then(function (response) {
                                      if(response.data.length>0){
                                          $scope.hotel = response.data;
                                          $scope.hotels = [$scope.hotel.length];

                                          angular.forEach($scope.hotel, function (value, key) {
                                              $scope.hotels[key] = { Id: value.HotelId, Name: value.Name };
                                          });
                                      } else {
                                          $scope.hotel = {};
                                          $scope.hotels = [$scope.hotel.length];


                                      }
                                  }, function (err) {
                                      $scope.error_description = err.error_description;
                                  });
                              }
                          });

                      }
                  });
              }
          };
      })
      app.directive('departmentSelect', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/department-select.html',
              controller: function ($scope, departmentService, $filter) {
                  angular.element(document).ready(function () {
                      $scope.clear = function () {
                          $scope.department.selected = undefined;
                      };

                      $scope.department = {};

                      $scope.selectActionDepartment = function () {
                          //if ($scope.$parent.$state.$current.name === "app.page.department_create" || $scope.$parent.$state.$current.name == "app.page.department_edit") {
                          //    $scope.$parent.department.HotelId = $scope.hotel.selected.Id;
                          //}
                          //if ($scope.$parent.$state.$current.name === "app.page.room_create" || $scope.$parent.$state.$current.name == "app.page.room_edit") {
                          //    $scope.$parent.room.HotelId = $scope.hotel.selected.Id;
                          //}
                          $scope.IdDepartment = $scope.department.selected.DepartmentId;
                          if ($scope.$parent.$state.$current.name === "app.page.product_list") {
                              departmentService.getProductssActivated($scope.department.selected.DepartmentId).then(function (response) {
                                  $scope.products = response.data;
                              });
                          }

                          //if ($scope.hotel.selected != undefined) {
                          //    hotelService.getHotelCatalogId($scope.hotel.selected.Id).then(function (response) {
                          //        if (response.data.length > 0)
                          //            $scope.$parent.IdCatalog = response.data[0].IdCatalogue;

                          //        if ($scope.$parent.$state.$current.name !== "app.page.product_list" && $scope.$parent.$state.$current.name !== "app.page.catalogue_assignProducts" && $scope.$parent.$state.$current.name !== "app.page.room_edit") {
                          //            $scope.loadHotelTreeCatalog($scope.IdCatalog);
                          //        }
                          //    });
                          //}
                      }

                      departmentService.getAll().then(function (response) {
                          $scope.department = response.data;
                          $scope.departments = [$scope.department.length];

                          angular.forEach($scope.department, function (value, key) {
                              $scope.departments[key] = { Id: value.DepartmentId, Name: value.Name };
                              if ($scope.currentDepartmentId != 0 && $scope.currentDepartmentId == value.DepartmentId) {
                                  $scope.department.selected = $scope.departments[key];
                              }
                          });

                          //if ($scope.$parent.$state.$current.name == "app.page.product_list") {
                          //    if ($scope.$parent.$state.params.hotel) {
                          //        var idx = $filter('getHotelKeyById')($scope.hotels, $scope.$state.params.hotel)
                          //        $scope.hotel.selected = $scope.hotels[idx];
                          //    } else
                          //        $scope.hotel.selected = $scope.hotels[0];

                          //    hotelService.getProductsActivated($scope.hotel.selected.Id).then(function (response) {
                          //        $scope.products = response.data;
                          //    });
                          //    if ($scope.hotel.selected != undefined) {
                          //        hotelService.getHotelCatalogId($scope.hotel.selected.Id).then(function (response) {
                          //            $scope.IdCatalog = response.data[0].IdCatalogue;
                          //            if ($scope.$parent.$state.$current.name !== "app.page.product_list" && $scope.$parent.$state.$current.name !== "app.page.catalogue_assignProducts" && $scope.$parent.$state.$current.name !== "app.page.room_edit")
                          //                $scope.$parent.loadHotelTreeCatalog($scope.IdCatalog);
                          //        });
                          //    }
                          //}
                      },
                        function (err) {
                            $scope.error_description = err.error_description;
                        });
                  });
              }
          };
      })
      app.directive('hotelSelect', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/hotel-select.html',
              controller: function ($scope, hotelService, $filter) {
                  angular.element(document).ready(function () {
                      $scope.clear = function () {
                          $scope.hotel.selected = undefined;
                      };
                     
                      $scope.hotel = {};

                      $scope.selectActionHotel = function ()
                      {
                          if ($scope.$parent.$state.$current.name === "app.page.department_create" || $scope.$parent.$state.$current.name == "app.page.department_edit")
                          {
                              $scope.$parent.department.HotelId = $scope.hotel.selected.Id;
                          }
                          if ($scope.$parent.$state.$current.name === "app.page.room_create" || $scope.$parent.$state.$current.name == "app.page.room_edit") {
                              $scope.$parent.room.HotelId = $scope.hotel.selected.Id;
                          }
                          
                          if ($scope.$parent.$state.$current.name === "app.page.product_list") {
                              hotelService.getProductsActivated($scope.hotel.selected.Id).then(function (response) {
                                  $scope.products = response.data;
                              });
                              hotelService.getDeparmentsActivated($scope.hotel.selected.Id).then(function (response) {
                                  $scope.departments = response.data;
                              });
                          }
                      
                          if ($scope.hotel.selected != undefined) {
                              hotelService.getHotelCatalogId($scope.hotel.selected.Id).then(function (response) {
                                  if(response.data.length>0)
                                      $scope.$parent.IdCatalog = response.data[0].IdCatalogue;

                                  if ($scope.$parent.$state.$current.name !== "app.page.product_list" && $scope.$parent.$state.$current.name !== "app.page.catalogue_assignProducts" && $scope.$parent.$state.$current.name !== "app.page.room_edit" ) {
                                      $scope.loadHotelTreeCatalog($scope.IdCatalog);
                                  }
                              });
                          }
                      }

                      hotelService.getAll().then(function(response) {
                            $scope.hotel = response.data;
                            $scope.hotels = [$scope.hotel.length]

                            angular.forEach($scope.hotel, function(value, key) {
                                $scope.hotels[key] = { Id: value.HotelId, Name: value.Name };
                                if ($scope.currentHotelId != 0 && $scope.currentHotelId == value.HotelId) {
                                    $scope.hotel.selected = $scope.hotels[key];
                                }
                            });

                            if ($scope.$parent.$state.$current.name == "app.page.product_list") {
                                if ($scope.$parent.$state.params.hotel) {
                                    var idx = $filter('getHotelKeyById')($scope.hotels, $scope.$state.params.hotel)
                                    $scope.hotel.selected = $scope.hotels[idx];
                                } else
                                    $scope.hotel.selected = $scope.hotels[0];

                                hotelService.getProductsActivated($scope.hotel.selected.Id).then(function(response) {
                                    $scope.products = response.data;
                                });
                                if ($scope.hotel.selected != undefined) {
                                    hotelService.getHotelCatalogId($scope.hotel.selected.Id).then(function(response) {
                                        $scope.IdCatalog = response.data[0].IdCatalogue;
                                        if ($scope.$parent.$state.$current.name !== "app.page.product_list" && $scope.$parent.$state.$current.name !== "app.page.catalogue_assignProducts" && $scope.$parent.$state.$current.name !== "app.page.room_edit")
                                            $scope.$parent.loadHotelTreeCatalog($scope.IdCatalog);
                                    });
                                }
                            }
                        },
                        function(err) {
                            $scope.error_description = err.error_description;
                        });
                    });
              }
          };
      })
      app.directive('hotelCatalogTree', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/catalog-tree.html',
              controller: function ($scope, catalogService, $state, $filter) {
                  $scope.catalogtree = {};
                  
                  $scope.checkChildren = function (item) {
                      $scope.cut_tree = $filter('ItemsCheckedTreeNode')(item);
                  }


                  $scope.loadHotelTreeCatalog = function (catalogId) {
                      $scope.items = {};
                      $scope.sourceItems = {};
                      catalogService.getCatalogComplex(catalogId,true, true, true, $scope.hotel.selected.Id).then(function (response) {
                          $scope.catalogComplex = {};
                          $scope.catalogComplex.Modules = {};
                          $scope.sourceItems = JSON.parse(response.data);
                          $scope.items = $scope.sourceItems;                
                          //$scope.Modules = $scope.catalogComplex.Modules;
                          //angular.forEach($scope.Modules, function (valueModule, keyModule) {
                          //    if ($state.current.name == "app.page.usercatalog") {
                          //        $scope.sourceItems[keyModule].ActiveCheckbox = true;
                          //    }
                          //});
                      },
                      function (err) {
                          $scope.toaster = {
                              type: 'error',
                              title: 'Error',
                              text: err.error_description
                          };
                          $scope.pop();
                      });
                  }

                  if($scope.cata !== undefined)
                    $scope.loadHotelTreeCatalog($scope.IdCatalog);
              }
          }
      })
      app.directive('catalogTree', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/catalog-tree.html',
              controller: function ($scope, catalogService, $state, $filter) {
                  $scope.catalogtree = {};
                  $scope.sourceItems = [{}];                  
                  $scope.currentItem = {};
                  $scope.checkChildren  = function(item)
                  {
                      $scope.cut_tree = $filter('ItemsCheckedTreeNode')(item);
                  }

                  $scope.toggle = function (item) {
                      //$("input[name='post[]']").prop('checked', '')
                      if ($scope.products === undefined)
                          return;
                      for (var i = 0; i < $scope.products.length; i++)
                      {
                          $scope.products[i].checked = false;
                      }
                      if ($scope.currentItem) {
                          $scope.currentItem.selected = false;
                      }
                      item.selected = !item.selected;
                      $scope.currentItem = item;
                      $scope.showSave = false;
                      if ($state.current.name == 'app.page.catalogue_assignProducts') {
                          if ($scope.currentItem.type == 'module') {
                              $scope.toaster = {
                                  type: 'info',
                                  title: 'Info',
                                  text: 'The Module can not be selected'
                              };
                              $scope.pop();
                              $scope.currentItem.selected = false;
                          }
                          else {
                              if (!item.IsFinal)
                              {
                                  $scope.toaster = { type: 'info', title: 'Info', text: 'The Category cannot be selected' };
                                  $scope.pop();
                                  $scope.currentItem.selected = false;
                                  return;
                              }
                              $(this).addClass('selected').siblings().removeClass('selected');
                              $scope.getProductsByCategory();

                          }                          
                      }
                  };
                  $scope.modifyItems = function (item, obj) {
                      $scope.IsNew = false;
                      if (item.type == "module") {
                          //if (item.Image != 'no-image.jpg')
                          //    $scope.rootFileModule = '/images/' + $scope.IdCatalog + '/modules/';
                          //else {
                          //    $scope.rootFileModule = '/img/';
                          //}
                          $scope.module = {
                              ModuleId: item.ModuleId,
                              IdTranslationName: item.IdTranslationName,
                              Prefix: item.Prefix,
                              Name: item.Name,
                              Image: item.Image,
                              Orden: item.Orden,
                              Comment: item.Comment,
                              Pending: item.Pending,
                              Active: item.Active,
                              Translation: {
                                  Id: item.Translation.Id,
                                  Spanish: item.Translation.Spanish,
                                  English: item.Translation.English,
                                  French: item.Translation.French,
                                  German: item.Translation.German,
                                  Language5: item.Translation.Language5,
                                  Language6: item.Translation.Language6,
                                  Language7: item.Translation.Language7,
                                  Language8: item.Translation.Language8,
                                  Active: item.Translation.Active
                              }
                          };
                          $scope.typeAction = 'module';
                          $scope.showTabsetCategory = false;
                          $scope.showTabsetModule = true;
                      } else {
                          //if (item.Image != 'img/no-image.jpg')
                          //    $scope.rootFileCategory = '/images/' + $scope.IdCatalog + '/categories/';
                          //else
                          //{
                          //    $scope.rootFileCategory = '/img/'
                          //}
                          $scope.category = {
                              CategoryId: item.CategoryId,
                              IdTranslationName: item.IdTranslationName,
                              IdTranslationDescription: item.IdTranslationDescription,
                              Prefix: item.Prefix,
                              Name: item.Name,
                              Image: item.Image,
                              Orden: item.Orden,
                              IsFirst: item.IsFirst,
                              IdParentCategory: item.IdParentCategory,
                              CategoryItem: item.CategoryItem,
                              Comment: item.Comment,
                              Pending: item.Pending,
                              IsFinal: item.IsFinal,
                              Active: item.Active,
                              Translation: {
                                  Id: item.Translation.Id,
                                  Spanish: item.Translation.Spanish,
                                  English: item.Translation.English,
                                  French: item.Translation.French,
                                  German: item.Translation.German,
                                  Language5: item.Translation.Language5,
                                  Language6: item.Translation.Language6,
                                  Language7: item.Translation.Language7,
                                  Language8: item.Translation.Language8,
                                  Active: item.Translation.Active

                              },
                              TranslationDescription: {
                                  Id: item.TranslationDescription.Id,
                                  Spanish: item.TranslationDescription.Spanish,
                                  English: item.TranslationDescription.English,
                                  French: item.TranslationDescription.French,
                                  German: item.TranslationDescription.German,
                                  Language5: item.TranslationDescription.Language5,
                                  Language6: item.TranslationDescription.Language6,
                                  Language7: item.TranslationDescription.Language7,
                                  Language8: item.TranslationDescription.Language8,
                                  Active: item.Translation.Active

                              }
                          };
                          $scope.typeAction = 'category';
                          $scope.showTabsetCategory = true;
                          $scope.showTabsetModule = false;
                      }
                  }
                  $scope.addItems = function (item, obj) {
                      $scope.IsNew = true;
                      $scope.module = {};
                      $scope.category = {};
                      ////$scope.rootFileModule = '/img/';
                      ////$scope.rootFileCategory = '/img/';
                      $scope.module = { Image: '/img/no-image.jpg', Active: true };
                      $scope.category = { Image: '/img/no-image.jpg', Pending: true, IsFinal: true, Active: true };
                      if (item.type == "module") {
                          $scope.typeAction = 'module';
                          $scope.module = {
                              ModuleId : item.Id,
                              Name: item.Name,
                              Image: item.Image,
                              Orden: item.Orden,
                              Comment: item.Comment,
                              Pending: item.Pending,
                              Active: item.Active
                          };
                          $scope.typeAction = 'module';
                            $scope.category.IsFirst = true;
                            $scope.IdModule = item.Id;
                      }
                      else {
                          $scope.typeAction = 'category';
                          $scope.category.IsFirst = false;
                      }

                      $scope.currentModule = obj.item;
                      
                      while (obj.item.type != 'module') {
                          obj = obj.$parent;
                          $scope.currentModule = obj.item;                       
                      }

                      if (item.nextsibling == "category") {
                          if(item.type == 'category')
                              $scope.category.IdParentCategory = item.CategoryId;

                          $scope.typeAction = 'category';
                          $scope.showTabsetCategory = true;
                          $scope.showTabsetModule = false;

                      }
                      else {
                          $scope.showTabsetCategory = false;
                          $scope.showTabsetModule = true;
                      }

                      $scope.category = { Image: '/img/no-image.jpg', IsFirst: $scope.category.IsFirst, IdParentCategory: $scope.category.IdParentCategory, CategoryItem: $scope.categoryItem, Active: true, Pending: true, IsFinal: true };
                  }
                  $scope.deleteItems = function (item) {
                      if (item.type == "category") {
                          $scope.CategoryId = item.CategoryId;
                          $('#deleteCategory').modal({
                              show: 'true'
                          });
                      }
                      else {
                          $scope.ModulelId = item.ModuleId;
                          $('#deleteModule').modal({
                              show: 'true'
                          });

                      };
                      
                  }
                  $scope.removeModule = function (id)
                  {
                      catalogService.removeModule(id).then(function (response) {
                          $scope.toaster = {
                              type: 'success',
                              title: 'Info',
                              text: 'The Module has been removed'
                          };
                          $scope.pop();
                          $scope.loadTreeCatalog($scope.IdCatalog);
                      },
                      function (err) {
                          $scope.toaster = { type: 'info', title: 'Info', text: err.data.Message };
                          $scope.pop();
                      });
                  }
                  $scope.removeCategory = function (id) {
                      catalogService.removeCategory(id).then(function (response) {
                          $scope.toaster = {
                              type: 'success',
                              title: 'Info',
                              text: 'The Category has been removed'
                          };
                          $scope.pop();
                          $scope.loadTreeCatalog($scope.IdCatalog);
                      },
                      function (err) {
                          $scope.toaster = { type: 'info', title: 'Info', text: err.data.Message };
                          $scope.pop();
                      });
                  }

                  //Cargo la estructura compleja del catalogo
                  $scope.loadTreeCatalog = function (id)
                  {
                      if (!$scope.cata) {
                          $scope.items = {};
                          $scope.sourceItems = {};
                          return;
                      }
                      $scope.items = {};
                      $scope.sourceItems = {};
                      var activemod = false;
                      var activecategory = false;
                      var userid = "";
                      if ($state.current.name == 'app.page.usercatalog') {
                          activemod = true;
                          activecategory = true;
                          userid = $scope.person.selected.id;
                      }
                      catalogService.getCatalogComplex(id, false, activemod, activecategory, 0, userid).then(function (response) {
                          $scope.catalogComplex = {};
                          $scope.catalogComplex.Modules = {};
                          $scope.sourceItems = JSON.parse(response.data);
                          $scope.items = $scope.sourceItems;                
                      },
                      function (err) {
                            $scope.error_description = err.error_description;
                      });

                      $scope.items = $scope.sourceItems;    
                  }

                  $scope.loadTreeCatalog($scope.IdCatalog);
            
              }
          };
      })
      app.directive('userForm', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/user-form.html',
          };
      })
      app.directive('hotelForm', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/hotel-form.html'         
          };
      })
      app.directive('departmentForm', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/department-form.html'
          };
      })
      app.directive('roomForm', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/room-form.html'
          };
      })

      app.directive('productForm', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/product-form.html'
          };
      })
      app.directive('productType', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/product-type.html',
              controller: function ($scope) {
                  $scope.productType = [{ name: 'Product' }, { name: 'Service' }, { name: 'Text' }];
              }
          };
      })

      app.directive('fileUpload', function () {
          return {
              restrict: 'E',
              templateUrl: 'tpl/partials/file-upload.html',
              controller: function ($scope, $http, $timeout, $upload) {
                      $scope.upload = [];
                      $scope.fileUploadObj = { testString1: "Test string 1", testString2: "Test string 2" };

                      $scope.onFileSelect = function ($files) {
                          //$files: an array of files selected, each file has name, size, and type.
                          for (var i = 0; i < $files.length; i++) {
                              var $file = $files[i];
                              (function (index) {
                                  $scope.upload[index] = $upload.upload({
                                      url: "./api/files/upload", // webapi url
                                      method: "POST",
                                      data: { fileUploadObj: $scope.fileUploadObj },
                                      file: $file
                                  }).progress(function (evt) {
                                      // get upload percentage
                                      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                  }).success(function (data, status, headers, config) {
                                      // file is uploaded successfully
                                      console.log(data);
                                  }).error(function (data, status, headers, config) {
                                      // file failed to upload
                                      console.log(data);
                                  });
                              })(i);
                          }
                      }

                      $scope.abortUpload = function (index) {
                          $scope.upload[index].abort();
                      }
              }
          };
      })

})();
