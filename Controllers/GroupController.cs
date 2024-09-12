using ASP_P15.Data;
using ASP_P15.Models.Group;
using ASP_P15.Services.Upload;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ASP_P15.Controllers
{
    [Route("api/group")]
    [ApiController]
    public class GroupController(IFileUploader fileUploader, DataContext dataContext) : ControllerBase
    {
        private readonly IFileUploader _fileUploader = fileUploader;
        private readonly DataContext _dataContext = dataContext;

        [HttpPost]
        public async Task<object> DoPost(GroupFormModel formModel)
        {
            var validationErrors = _Validate(formModel);
            if (validationErrors.Any(e => e.Value != null))
            {
                HttpContext.Session.SetString("shop-group-errors", JsonSerializer.Serialize(validationErrors));
                HttpContext.Session.SetString("shop-group-data", JsonSerializer.Serialize(formModel));

                return new
                {
                    code = 400,
                    status = "error",
                    errors = validationErrors
                };
            }

            String uploadedName;

            try
            {
                uploadedName = _fileUploader.UploadFile(formModel.ImageFile, "./Uploads/Shop");

                _dataContext.Groups.Add(new()
                {
                    Id = Guid.NewGuid(),
                    Name = formModel.Name,
                    Description = formModel.Description,
                    Image = uploadedName,
                    DeleteDt = null,
                    Slug = formModel.Slug
                });

                await _dataContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return new
                {
                    code = 500,
                    status = "error",
                    message = ex.Message
                };
            }

            return new
            {
                code = 200,
                status = "OK",
                message = "Created"
            };
        }

        private Dictionary<string, string?>? _Validate(GroupFormModel model)
        {
            Dictionary<string, string?> res = new();

            res[nameof(model.Name)] = String.IsNullOrEmpty(model.Name)
                ? "Назва групи не може бути порожньою"
                : model.Name.Length >= 2 ? null : "Назва групи має бути не менш як 2 символи";

            res[nameof(model.Description)] = String.IsNullOrEmpty(model.Description)
                ? "Опис групи не може бути порожнім"
                : null;

            res[nameof(model.Slug)] = String.IsNullOrEmpty(model.Slug)
                ? "Slug не може бути порожнім"
                : null;

            res[nameof(model.ImageFile)] = model.ImageFile == null
                ? "Зображення є обов'язковим"
                : null;

            return res;
        }
    }
}
