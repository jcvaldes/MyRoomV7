'use strict';
/* Controllers */
// product controller
app.controller('ProductsController', ['$scope', '$localStorage', '$http', '$state', '$stateParams', 'productService', 'DTOptionsBuilder', 'DTColumnDefBuilder', '$filter', 'toaster', '$timeout', 'FileUploader', 'ngWebBaseSettings', function ($scope, $localStorage, $http, $state, $stateParams, productService, DTOptionsBuilder, DTColumnDefBuilder, $filter, toaster, $timeout, FileUploader, ngWebBaseSettings) {
    var uploader = $scope.uploader = new FileUploader({
        //url: ngWebBaseSettings.webServiceBase + 'api/files/Upload?var=5-0-0'
    });
    var uploaderUrl = $scope.uploaderUrl = new FileUploader({
        //url: ngWebBaseSettings.webServiceBase + 'api/files/Upload?var=1-0-0'
    });
    // var ischecked = $filter('ischecked');
    $scope.IdDepartment = 0;
    $scope.IdCatalog = 0;
    $scope.toaster = {
        type: 'error',
        title: 'Info',
        text: 'Only 6 Related product are permited'
    };
    $scope.products = {};
    $scope.rootFile = '/img/';
    $scope.product = {
        Prefix: '',
        Name: '',
        Description: '',
        Price: '0.00',
        Active: true,
        Image: '/img/no-image.jpg',
        UrlScanDocument: '/img/no-image.jpg',
        Order: '0',
        IdDepartment: 0,
        Translation: {
            Spanish: '',
            English: '',
            French: '',
            German: '',
            Language5: '',
            Language6: '',
            Language7: '',
            Language8: '',
            Active: true
        },
        TranslationDescription: {
            Spanish: '',
            English: '',
            French: '',
            German: '',
            Language5: '',
            Language6: '',
            Language7: '',
            Language8: '',
            Active: true
        },
        RelatedProducts: [{ IdRelatedProduct: 0 }]
    };
    $scope.menssage = '';
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        $state.go('app.page.product_list');
    };
    uploaderUrl.onSuccessItem = function (fileItem, response, status, headers) {
        $state.go('app.page.product_list');
    };
    uploader.onAfterAddingFile = function (fileItem) {
        if (fileItem.file.size > ngWebBaseSettings.fileSize) {
            $scope.toaster = {
                type: 'error',
                title: 'Info',
                text: 'File too big'
            };
            $scope.pop();
            return;
        }
        $scope.file = fileItem._file;
        $scope.fileItem = fileItem;
        $scope.product.Image = $scope.file.name;
        var fr = new FileReader();
        fr.onload = function (e) {
            $('#imageProd')
                .attr('src', e.target.result)
        }
        fr.readAsDataURL(fileItem._file);
    };
    uploaderUrl.onAfterAddingFile = function (fileItem) {
        if (fileItem.file.size > ngWebBaseSettings.fileSize) {
            $scope.toaster = {
                type: 'error',
                title: 'Info',
                text: 'File too big'
            };
            $scope.pop();
            return;
        }
        $scope.fileUrl = fileItem._file;
        $scope.fileItemUrl = fileItem;
        $scope.product.UrlScanDocument = $scope.fileUrl.name;
        var fr = new FileReader();
        fr.onload = function (e) {
            $('#imageUrlScanDocument')
                .attr('src', e.target.result)
        }
        fr.readAsDataURL(fileItem._file);
    };
    $scope.pop = function () {
        toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
    };

    
    if ($state.current.name == "app.page.product_edit") {
  
//        var param = $state.params['catalog'].split("-");
  //      var id = param[1];
        var idCatalog = $localStorage.selectedProduct.catalog;
        $scope.IdCatalog = idCatalog;
        
        productService.getProduct($state.params['id']).then(function (response) {
            $scope.product = JSON.parse(response.data);
            $scope.rootFile = '/images/' + $scope.IdCatalog + '/products/';
         
        });

        productService.getRelatedProducts($state.params['id'], $localStorage.selectedProduct.hotel).then(function (response) {
            $scope.products = response.data;

            //for (var j = 0 ; j < $scope.product.RelatedProducts.length; j++) {
               for (var i = 0 ; i < $scope.products.length; i++) {
                   if ($scope.products[i].Checked) {
                        $scope.products[i].checked = true;
                    }
                }
            //}

        },
         //productService.getAll().then(function (response) {
         //    $scope.products = response.data.filter(function (e) {
         //       return e.Id !== $scope.product.Id;
         //    });

         //    for (var j = 0 ; j < $scope.product.RelatedProducts.length; j++) {
         //        for (var i = 0 ; i < $scope.products.length; i++) {
         //            if ($scope.products[i].Id == $scope.product.RelatedProducts[j].IdRelatedProduct) {
         //                $scope.products[i].checked = true;
         //            }
         //        }
         //    }

         //},
         function (err) {
             $scope.toaster = { type: 'error', title: 'Error', text: err.error_description };
             $timeout(function () {
                 $scope.pop();
             }, 1000);
         });

        //for (var i = 0; i < $scope.products.length - 1; i++) {
        //    if ($scope.products[i].Id == $scope.product.RelatedProducts[i].IdRelatedProduct)
        //        response.data[i].checked = true;
        //}

    }
    else {
        productService.getRelatedProductsByHotelId($localStorage.selectedProduct.hotel).then(function (response) {

            $scope.products = response.data;
        },
          function (err) {
              $scope.toaster = { type: 'error', title: 'Error', text: err.error_description };
              $timeout(function () {
                  $scope.pop();
              }, 1000);
          });

    }

    function createProductVM(entity) {
        $scope.product.RelatedProducts = [];       
        angular.forEach($scope.products, function (value, key) {
            if (value.Checked == true) {
                $scope.product.RelatedProducts.push({ IdProduct: $scope.product.Id, IdRelatedProduct: value.Id });

            }
        });
        var vm = {};
        vm.Name = entity.Name;
        if (entity.Image != "/img/no-image.jpg" ) {
            vm.Pending = true;
            if ($state.current.name == "app.page.product_edit") {
                if (entity.Image.split('/').length > 1)
                    vm.Image = entity.Image;
                else
                    vm.Image = "/images/" + $localStorage.selectedProduct.catalog + "/products/" + entity.Image;
            }
            else {
                vm.Image = "/images/" + $localStorage.selectedProduct.catalog + "/products/" + entity.Image;
            }
            vm.CatalogId = $localStorage.selectedProduct.catalog;

        }
        else {
            vm.Pending = false;
            vm.Image = entity.Image;
            vm.CatalogId = $localStorage.selectedProduct.catalog;
        }

        if (entity.UrlScanDocument != "/img/no-image.jpg") {
            vm.Pending = true;
            var sw = false;
            if ($state.current.name == "app.page.product_edit") {
                if (entity.UrlScanDocument ==   "") sw = true;
                if (entity.UrlScanDocument ==  "-") sw = true;
                if (entity.UrlScanDocument == null) sw = true;
                //if (entity.UrlScanDocument != null || entity.UrlScanDocument != "" || entity.UrlScanDocument != "-") {
                if (!sw) {
                    if (entity.UrlScanDocument.split('/').length > 1)
                        vm.UrlScanDocument = entity.UrlScanDocument;
                    else
                        vm.UrlScanDocument = "/images/" + $localStorage.selectedProduct.catalog + "/moreinfo/" + entity.UrlScanDocument;
                } else {
                    entity.UrlScanDocument = null;
                }
            }
            else {
                vm.UrlScanDocument = "/images/" + $localStorage.selectedProduct.catalog + "/moreinfo/" + entity.UrlScanDocument;
            }
            vm.CatalogId = $localStorage.selectedProduct.catalog;

        }
        else {
            vm.Pending = false;
            if (entity.UrlScanDocument == "/img/no-image.jpg") {
                vm.UrlScanDocument = null;
            } else {
                vm.UrlScanDocument = entity.UrlScanDocument;
            }
            vm.CatalogId = $localStorage.selectedProduct.catalog;
        }
        vm.HotelId = $localStorage.selectedProduct.hotel;
        vm.Description = entity.Description;
        vm.Price = entity.Price;
        vm.ProductActive = entity.ProductActive;
        vm.Prefix = entity.Prefix;        
        vm.Order = entity.Order;
        vm.IdDepartment = entity.IdDepartment,
        vm.Type = entity.Type;
        //vm.UrlScanDocument = entity.UrlScanDocument;
        vm.EmailMoreInfo = entity.EmailMoreInfo;
        vm.Standard = entity.Standard;
        vm.Premium = entity.Premium;
        vm.Active = entity.Active;
        vm.Spanish = entity.Translation.Spanish;
        vm.English = entity.Translation.English;
        vm.French = entity.Translation.French;
        vm.German = entity.Translation.German;
        vm.TranslationActive = entity.Translation.Active;
        vm.Language5 = entity.Translation.Language5;
        vm.Language6 = entity.Translation.Language6;
        vm.Language7 = entity.Translation.Language7;
        vm.Language8 = entity.Translation.Language8;
        
        vm.SpanishDesc = entity.TranslationDescription.Spanish;
        vm.EnglishDesc = entity.TranslationDescription.English;
        vm.FrenchDesc = entity.TranslationDescription.French;
        vm.GermanDesc = entity.TranslationDescription.German;
        vm.TranslationActiveDesc = entity.TranslationDescription.Active;
        vm.LanguageDesc5 = entity.TranslationDescription.Language5;
        vm.LanguageDesc6 = entity.TranslationDescription.Language6;
        vm.LanguageDesc7 = entity.TranslationDescription.Language7;
        vm.LanguageDesc8 = entity.TranslationDescription.Language8;

        vm.RelatedProducts = $scope.product.RelatedProducts;
        
        return vm;
    }
    $scope.cancel = function () {
        $state.go('app.page.product_list', { 'hotel': $localStorage.selectedProduct.hotel });
        delete $localStorage.selectedProduct;

    }
    $scope.saveProduct = function () {
        $scope.IdDepartment = $localStorage.selectedProduct.department;//Modificar
        $scope.product.IdDepartment = $scope.IdDepartment;
        var productVm = createProductVM($scope.product);
        if ($state.current.name == "app.page.product_create" ) {
            $scope.IdCatalog = $localStorage.selectedProduct.catalog;//$state.params['catalog'];
            $scope.rootFile = '/images/' + $scope.IdCatalog + '/';
    
            productService.saveProduct(productVm).then(function (response) {
                //$scope.Id = response.data.Id;
                $scope.toaster = { type: 'success', title: 'Info', text: 'The Product has been saved' };
                $timeout(function () {
                    $scope.pop();
                }, 1000);
                if ($scope.fileItem !== undefined) {
                    //Para subir la imagen
                    $scope.fileItem.url = ngWebBaseSettings.webServiceBase + 'api/files/Upload?var=5-' + $scope.IdCatalog + '-0';
                    uploader.uploadAll();
                }
                if ($scope.fileItemUrl !== undefined) {
                    //Para subir la imagen
                    $scope.fileItemUrl.url = ngWebBaseSettings.webServiceBase + 'api/files/Upload?var=6-' + $scope.IdCatalog + '-0';
                        uploaderUrl.uploadAll();
                }
                $scope.product = {
                Active: true,
                Image: '/img/no-image.jpg',
                UrlScanDocument: '/img/no-image.jpg',
                Translation: {
                    Active: true
                },
                    RelatedProducts: []
                };
                $state.go('app.page.product_list', { 'hotel': $scope.$stateParams.hotel });
                // $scope.message = "The Product has been saved";
            },
            function (err) {
                $scope.toaster = {
                    type: 'error',
                    title: 'Error',
                    text: err.error_description
                };
            });
        }
        else {
            $scope.product.Image = productVm.Image;
            $scope.product.UrlScanDocument = productVm.UrlScanDocument;
            $scope.product.Pending = productVm.Pending;
            productService.updateProduct($scope.product).then(function (response) {
                $scope.toaster = { type: 'success', title: 'Info', text: 'The Product has been updated' };
                if ($scope.fileItem) {
                    $scope.fileItem.url = ngWebBaseSettings.webServiceBase + 'api/files/Upload?var=5-' + $scope.IdCatalog + '-0';
                    uploader.uploadAll();
                }
                if ($scope.fileItemUrl !== undefined) {
                    //Para subir la imagen
                    $scope.fileItemUrl.url = ngWebBaseSettings.webServiceBase + 'api/files/Upload?var=6-' + $scope.IdCatalog + '-0';
                    uploaderUrl.uploadAll();
                }
                $timeout(function () {
                    $scope.pop();
                }, 1000);
                $scope.product = {
                    Active: true,
                    Image: 'no-image.jpg',
                    UrlScanDocument: 'no-image.jpg',
                    Translation: {
                        Active: true
                    },
                    RelatedProducts: []
                };
                
                $state.go('app.page.product_list', { 'hotel': $localStorage.selectedProduct.hotel });
            },
            function (err) {
                $scope.toaster = {
                    type: 'error',
                    title: 'Error',
                    text: err.error_description
                };
            });
        }
      


    };
   

//    $scope.getAllProduct();
}]);
app.controller('ProductsListController', ['$scope', '$localStorage', '$http', '$state', 'productService', '$injector', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'toaster', '$timeout', 'currentUser', 'departmentService', function ($scope, $localStorage, $http, $state, productService, $injector, DTOptionsBuilder, DTColumnDefBuilder, toaster, $timeout, currentUser, departmentService) {
    $scope.products = {};
    $scope.currentProdId = 0;
    $scope.IdCatalog = 0;
    $scope.toaster = {
        type: 'success',
        title: 'Info',
        text: 'The product has been removed'
    };

    angular.element(document).ready(function () {
        $scope.dtOptions = DTOptionsBuilder
                            .newOptions()
                            .withOption('iDisplayLength', 50)
                            .withBootstrap()
                            .withPaginationType('full_numbers');

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef('Id'),
            DTColumnDefBuilder.newColumnDef('Name'),
            DTColumnDefBuilder.newColumnDef('Price'),
            DTColumnDefBuilder.newColumnDef('Prefix'),
            DTColumnDefBuilder.newColumnDef('Type'),
            DTColumnDefBuilder.newColumnDef('Active').notSortable(),
            DTColumnDefBuilder.newColumnDef(null).notSortable(),

        ];
        $scope.pop = function () {
            toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
        };
        $scope.createProduct = function () {
            if ($scope.IdCatalog == 0) {
                $scope.toaster = {
                    type: 'error',
                    title: 'Error',
                    text: 'Selected Catalog'
                };
                $scope.pop();
                return;
            }
            $scope.IdDepartment = 0;
            if ($scope.department.selected !== undefined)
                $scope.IdDepartment = $scope.department.selected.DepartmentId;

            $localStorage.selectedProduct = { hotel: $scope.hotel.selected.Id, catalog: $scope.IdCatalog, department: $scope.IdDepartment };
            //if (!currentUser.getOpcion2())
                $state.go('app.page.product_create');
        };

        $scope.modifyProduct = function (id) {
            if ($scope.IdCatalog == 0) {
                $scope.toaster = {
                    type: 'warning',
                    title: 'Warning',
                    text: 'Hotel has not Assign Catalog'
                };
                $scope.pop();
            }
            $scope.currentProdId = id;

            $scope.IdDepartment = 0;
            if ($scope.department.selected !== undefined)
                $scope.IdDepartment = $scope.department.selected.DepartmentId;
                
            $localStorage.selectedProduct = { id: id, hotel: $scope.hotel.selected.Id, catalog: $scope.IdCatalog, department: $scope.IdDepartment };

            //$state.go('app.page.product_edit', result);

            //$state.go('app.page.product_edit', { "id": $scope.IdCatalog + '-' + id });
            $state.go('app.page.product_edit', { "id": id });
        }

        $scope.selectProduct = function (id) {
            $scope.currentProdId = id;
            $('#deleteProduct').modal({
                show: 'true'
            });
        }

        $scope.removeProduct = function (id) {
            productService.removeProduct(id).then(function (response) {
                var hotelService = $injector.get("hotelService");
                //$scope.Id = response.data.Id;
                $scope.product = {
                    Active: true,
                    Image: 'no-image.jpg',
                    Translation: {
                        Active: true
                    }
                };
                $scope.toaster = { type: 'Success', title: 'Success', text: 'The Product has been removed' };
                $scope.pop();
                hotelService.getProductsActivated($scope.hotel.selected.Id).then(function (response) {
                    $scope.products = response.data;
                });
                departmentService.getProductssActivated($scope.department.selected.DepartmentId).then(function (response) {
                    $scope.products = response.data;
                });
            },
            function (err) {
                $scope.toaster = { type: 'info', title: 'Info', text: err.data.Message };
                $scope.pop();
            });

            
        };
    });
}])
;