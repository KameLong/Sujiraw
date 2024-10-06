using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Sujiraw.Server.SignalR;
using System.Security.Claims;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);
//RESTAPI��Controllers�Ŏ���
builder.Services.AddControllers();
//���A���^�C���X�V��SignalR�Ŏ���
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            var a = builder.Configuration.GetSection("Cors:Origins").Get<string[]>();
            policy.WithOrigins(a);
            policy.AllowAnyMethod();
            policy.AllowAnyHeader();
            policy.AllowCredentials();
        });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(JwtBearerDefaults.AuthenticationScheme, policy =>
    {
        policy.AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme);
        policy.RequireClaim(ClaimTypes.Name);
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{builder.Configuration["Firebase:id"]}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{builder.Configuration["Firebase:id"]}",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Firebase:id"],
            ValidateLifetime = true
        };
        //signalR�p�ɕK�v�ȏ����ł��B
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };

    });
//�ʐM�ʍ팸�̂��߁Ajson���X�|���X�����k���đ��M���܂��B
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseResponseCompression();

app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins);
//app.UseAuthentication();
//app.UseAuthorization();

app.MapControllers();
app.MapHub<SujirawHub>("/ws/sujiraw");

app.MapFallbackToFile("index.html");

app.Run();