using Forum2.Data;
using Forum2.Implementations;
using Forum2.Models;
using Forum2.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Forum2.Security
{
    public class JwtService
    {
        private readonly IConfiguration _config;
        private readonly IUserService _userService;
        public JwtService(IConfiguration config,IUserService userService)
        {
            _config = config;
            _userService = userService;
        }

        public string CreateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, Convert.ToString(user.Id)),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email,user.Email),
                new Claim(ClaimTypes.Role,user.Role.ToString())
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)); //Tokeni imzalamak icin kullanilan gizli anahtar
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512); //Tokeni imzalamak icin kullanilan algoritma    

            var tokenDescriptor = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"], //tokeni veren
                audience: _config["Jwt:Audience"], //tokeni kullanacak olan
                claims: claims, //tokenin icerigi
                expires: DateTime.Now.AddDays(1), //tokenin gecerlilik suresi
                signingCredentials: creds //tokenin imzasi
                ); 

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor); //tokeni string olarak dondurur
        }
    }
}
