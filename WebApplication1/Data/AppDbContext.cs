using Microsoft.EntityFrameworkCore;

namespace Forum2.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Models.User> Users { get; set; }
        public DbSet<Models.Post> Posts { get; set; }
        public DbSet<Models.Category> Categories { get; set; }
        public DbSet<Models.Comment> Comments { get; set; }
        public DbSet<Models.Like> Likes { get; set; }
        public DbSet<Models.FriendRequest> FriendRequests { get; set; }
        public DbSet<Models.Friends> Friends { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

            //Post - Category relationship (N-N)
            modelBuilder.Entity<Models.Post>()
                .HasMany(p => p.Categories)
                .WithMany(c => c.Posts)
                .UsingEntity(j => j.ToTable("PostCategories"));
            //FriendRequest - User relationship (1-N)
            modelBuilder.Entity<Models.FriendRequest>()
                .HasOne(fr => fr.Sender)
                .WithMany(u => u.SentFriendRequests)
                .HasForeignKey(fr => fr.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Models.FriendRequest>()
                .HasOne(fr => fr.Receiver)
                .WithMany(u => u.ReceivedFriendRequests)
                .HasForeignKey(fr => fr.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
            //User - Friends relationship (1-N)
            modelBuilder.Entity<Models.Friends>()
                .HasKey(f => new { f.UserId, f.FriendId }); //Aynı kullanıcı aynı arkadaşı birden fazla ekleyemez
            modelBuilder.Entity<Models.Friends>()
                .HasOne(f => f.User)
                .WithMany(u => u.Friends)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Models.Friends>()
                .HasOne(f => f.Friend)
                .WithMany(u => u.FriendOf)
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Restrict);
            //Like - User relationship (1-N)
            modelBuilder.Entity<Models.Like>()
                .HasOne(l => l.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            //Like - Post relationship (1-N)
            modelBuilder.Entity<Models.Like>()
                .HasOne(l => l.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Models.Like>()
                .HasKey(l => new { l.UserId, l.PostId }); //Aynı kullanıcı aynı gönderiyi birden fazla beğenemez
            //Comment - Post relationship (1-N)
            modelBuilder.Entity<Models.Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);
            //Comment - User relationship (1-N)
            modelBuilder.Entity<Models.Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            //Post - User relationship (1-N)
            modelBuilder.Entity<Models.Post>()
                .HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
    }
