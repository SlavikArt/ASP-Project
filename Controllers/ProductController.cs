using ASP_P15.Data;
using ASP_P15.Models.Group;
using ASP_P15.Models.Shop;
using ASP_P15.Services.Upload;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace ASP_P15.Controllers
{
    [Route("api/product")]
    [ApiController]
    public class ProductController(IFileUploader fileUploader, DataContext dataContext) : ControllerBase
    {
        private readonly IFileUploader _fileUploader = fileUploader;
        private readonly DataContext _dataContext = dataContext;

        [HttpPost]
        public async Task<object> DoPost(ShopProductFormModel formModel)
        {
            var validationErrors = _Validate(formModel);
            if (validationErrors.Any(e => e.Value != null))
            {
                HttpContext.Session.SetString("shop-product-errors", JsonSerializer.Serialize(validationErrors));
                HttpContext.Session.SetString("shop-product-data", JsonSerializer.Serialize(formModel));
                return new { code = 400, status = "error", errors = validationErrors };
            }

            String uploadedName;
            try
            {
                uploadedName = _fileUploader.UploadFile(formModel.ImageFile, "./Uploads/Shop");
                _dataContext.Products.Add(new()
                {
                    Id = Guid.NewGuid(),
                    Name = formModel.Name,
                    Description = formModel.Description,
                    Image = uploadedName,
                    DeleteDt = null,
                    Slug = formModel.Slug,
                    Price = formModel.Price,
                    Amount = formModel.Amount,
                    GroupId = formModel.GroupId,
                });
                await _dataContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return new { code = 500, status = "error", message = ex.Message };
            }

            return new { code = 200, status = "OK", message = "Created" };
        }

        private Dictionary<string, string?>? _Validate(ShopProductFormModel model)
        {
            Dictionary<String, String?> res = new();

            res[nameof(model.Name)] = String.IsNullOrEmpty(model.Name) || model.Name.Length < 2 ? "Поле не може бути порожнім і повинно містити хоча б два символи" : null;

            res[nameof(model.Description)] = String.IsNullOrEmpty(model.Description) ? "Поле не може бути порожнім" : null;

            res[nameof(model.Price)] = model.Price < 0 ? "Ціна не може бути меншою за 0" : null;

            res[nameof(model.Amount)] = model.Amount < 0 ? "Кількість не може бути меншою за 0" : null;

            return res;
        }
    }
}
