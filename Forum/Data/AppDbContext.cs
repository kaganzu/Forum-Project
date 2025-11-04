using Forum2.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Forum2.Data
{
    public class AppDbContext : DbContext
    {
        private readonly PasswordHasher<User> _passwordHasher = new PasswordHasher<User>();

        public AppDbContext()
        {
        }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<FriendRequest> FriendRequests { get; set; }
        public DbSet<Friends> Friends { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            Seed(modelBuilder);
        }
            private void Seed(ModelBuilder modelBuilder)
        {
            var AdminUser = new User
            {
                Id = 1,
                Username = "kagan.id",
                Email = "kaganidilman@gmail.com",
                Role = UserRole.Admin,
            };
            var ModeratorUser = new User
            {
                Id = 2,
                Username = "moderator.id",
                Email = "kagankaramazov@gmail.com",
                Role = UserRole.Moderator,
            };
            AdminUser.PasswordHash = _passwordHasher.HashPassword(AdminUser,"idilman2005");
            ModeratorUser.PasswordHash = _passwordHasher.HashPassword(ModeratorUser,"moderator2005");
            modelBuilder.Entity<User>().HasData(AdminUser);
            modelBuilder.Entity<User>().HasData(ModeratorUser);

            //Post - Category relationship (N-N)
            modelBuilder.Entity<Post>()
                .HasMany(p => p.Categories)
                .WithMany(c => c.Posts)
                .UsingEntity(j => j.ToTable("PostCategories"));
            //FriendRequest - User relationship (1-N)
            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.Sender)
                .WithMany(u => u.SentFriendRequests)
                .HasForeignKey(fr => fr.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.Receiver)
                .WithMany(u => u.ReceivedFriendRequests)
                .HasForeignKey(fr => fr.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
            //User - Friends relationship (1-N)
            modelBuilder.Entity<Friends>()
                .HasOne(f => f.User)
                .WithMany(u => u.Friends)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Friends>()
                .HasOne(f => f.Friend)
                .WithMany() 
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Restrict);
            //Like - User relationship (1-N)
            modelBuilder.Entity<Like>()
                .HasOne(l => l.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            //Like - Post relationship (1-N)
            modelBuilder.Entity<Like>()
                .HasOne(l => l.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Like>()
                .HasKey(l => new { l.UserId, l.PostId }); //Aynı kullanıcı aynı gönderiyi birden fazla beğenemez
            //Comment - Post relationship (1-N)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);
            //Comment - User relationship (1-N)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            //Post - User relationship (1-N)
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
