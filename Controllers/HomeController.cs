using ASP_P15.Models;
using ASP_P15.Models.Home;
using ASP_P15.Services.Hash;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace ASP_P15.Controllers
{
    public class HomeController : Controller
    {
        // ������� �������� - _logger
        private readonly ILogger<HomeController> _logger;
        // ��������� ��� (���-) �����
        private readonly IHashService _hashService;

        public HomeController(ILogger<HomeController> logger, IHashService hashService)
        {
            _logger = logger;
            _hashService = hashService;
            /* �������� ����� ����������� - ������� �������������� ������. 
               ��������� ����� (��������) ������ ��������� ������������ � ��� 
               ��������� �� ����� �������� ��'���� (��������) �����
            */
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }
        
        public IActionResult Intro()
        {
            return View();
        }
        
        public IActionResult Razor()
        {
            return View();
        }

        public IActionResult Ioc()
        {
            ViewData["hash"] = _hashService.Digest("123");
            ViewData["hashCode"] = _hashService.GetHashCode();
            return View();
        }

        public IActionResult SignUp()
        {
            SignUpPageModel model = new();

            // �� ������� ���������� �� � ��������� ���� 
            if(HttpContext.Session.Keys.Contains("signup-data"))
            {
                // � ��� - �� ��������, ���������� ���
                var formModel = JsonSerializer.Deserialize<SignUpFormModel>(
                    HttpContext.Session.GetString("signup-data")!)!;

                model.FormModel = formModel;
                model.ValidationErrors = _Validate(formModel);

                ViewData["data"] = $"email: {formModel.UserEmail}, name: {formModel.UserName}";
                
                // ��������� ��� � ���, ��� �������� ���������� ����������
                HttpContext.Session.Remove("signup-data");
            }
            return View(model);
        }

        public IActionResult Demo([FromQuery(Name="user-email")] String userEmail, [FromQuery(Name = "user-name")] String userName)
        {
            /* ������ ����� �� �����, ������ 1: ����� ��������� action 
             * ��'�������� ����������� ���������� �� ����� ����
             * <input name="userName"/> ------ Demo(String userName)
             * ���� � HTML ���������������� �����, �� �������� � C#
             * (user-name), �� �������� ������� [From...] �� ����������� ����
             * ����� �������� ����������
             * 
             * ������ 1 ��������������� ���� ������� ��������� �������� (1-2)
             * ����� �������������� ����� - ������������ �������
             */
            ViewData["data"] = $"email: {userEmail}, name: {userName}";
            return View();
        }

        public IActionResult RegUser(SignUpFormModel formModel)
        {
            HttpContext.Session.SetString("signup-data", 
                JsonSerializer.Serialize(formModel));
            
            return RedirectToAction(nameof(SignUp));

            // ViewData["data"] = $"email: {formModel.UserEmail}, name: {formModel.UserName}";
            // return View("Demo");
            /* ��������: ���� ������� ���������� ����� �������� �����, ��
             * �� ��������� � �������
             * �) ���� �����������, �� ��� �� �� ��������
             * �) �������� ������ ��� �����, �� ���� ��������� �� 
             *     ���������� ����� � ��, �����, ����
             * г�����: "�������� �����" - ������������� ������ �� 
             *  �����'����������� �����
             *  
             *  Client(Browser)                    Server(ASP)
             *  [form]--------- POST RegUser --------->  [form]---Session
             *  <-------------- 302 SignUp -----------             |
             *  --------------- GET SignUp ----------->            |
             *   <-----------------HTML----------------------- ����������
             *   
             * ��������� �� ������������ ���� - ���. https://learn.microsoft.com/en-us/aspnet/core/fundamentals/app-state  
             */
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }



        private Dictionary<String, String?> _Validate(SignUpFormModel model)
        {
            /* �������� - �������� ����� �� ���������� ������ ��������/��������
             * ��������� �������� - {
             *   "UserEmail": null,          null - �� ������ ������ ��������
             *   "UserName": "Too short"     �������� - ����������� ��� �������
             * }
             */
            Dictionary<String, String?> res = new();

            var emailRegex = new Regex(@"^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$");
            res[nameof(model.UserEmail)] =
                String.IsNullOrEmpty(model.UserEmail)
                ? "�� ����������� ������ ����"
                : emailRegex.IsMatch(model.UserEmail)
                    ? null
                    : "������ �������� ������";
            
            var nameRegex = new Regex(@"^\w{2,}(\s+\w{2,})*$");
            res[nameof(model.UserName)] =
                String.IsNullOrEmpty(model.UserName)
                ? "�� ����������� ������ ����"
                : nameRegex.IsMatch(model.UserName)
                    ? null
                    : "������ �������� ��'�";

            if (String.IsNullOrEmpty(model.UserPassword))
            {
                res[nameof(model.UserPassword)] = "�� ����������� ������ ����";
            }
            else if(model.UserPassword.Length < 3)
            {
                res[nameof(model.UserPassword)] = "������ �� ���� �� �������� �� 8 �������";
            }
            else 
            {
                List<String> parts = [];
                if (!Regex.IsMatch(model.UserPassword, @"\d"))
                {
                    parts.Add(" ���� �����");
                }
                if (!Regex.IsMatch(model.UserPassword, @"\D"))
                {
                    parts.Add(" ���� �����");
                }
                if (!Regex.IsMatch(model.UserPassword, @"\W"))
                {
                    parts.Add(" ���� ����������");
                }
                if (parts.Count > 0)
                {
                    res[nameof(model.UserPassword)] = 
                        "������ ������� ������ ����������" + String.Join(',', parts);
                }
                else
                {
                    res[nameof(model.UserPassword)] = null;
                }                
            }


            res[nameof(model.UserRepeat)] = model.UserPassword == model.UserRepeat
                ? null
                : "����� �� ���������";


            res[nameof(model.IsAgree)] = model.IsAgree 
                ? null 
                : "��������� �������� ������� �����";

            return res;
        }
    }
}
