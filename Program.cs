using ASP_P15.Data;
using ASP_P15.Middleware.SessionAuth;
using ASP_P15.Services.Hash;
using ASP_P15.Services.Kdf;
using ASP_P15.Services.Upload;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

/* Місце для реєстрації служб - між створенням builder та його використанням (app) 
 * Реєстрація - співставлення інтерфейсу з класом за формулою 
 * "Буде запит на IHashService - видати об'єкт класу Md5HashService"
 */
// builder.Services.AddSingleton<IHashService, Md5HashService>();
builder.Services.AddSingleton<IHashService, ShaHashService>();
builder.Services.AddSingleton<IKdfService, Pbkdf1Service>();
builder.Services.AddSingleton<IFileUploader, FileUploadService>();

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(10);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Реєструємо контекст даних
builder.Services.AddDbContext<DataContext>( options => 
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("LocalDb")
    )
);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
            var exception = exceptionHandlerPathFeature?.Error;

            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                code = 500,
                message = exception?.Message ?? "An unexpected fault occurred."
            }));
        });
    });


    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.UseSession();

app.UseCors("AllowAll");

// Наші Middleware
app.UseSessionAuth();

app.MapControllerRoute(   // маршрутизатор
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
