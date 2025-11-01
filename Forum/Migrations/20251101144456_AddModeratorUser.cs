using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Forum2.Migrations
{
    /// <inheritdoc />
    public partial class AddModeratorUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEMrFgOHHTvE0JSOOF52kZQ/yBgVvufPx3B2Nya8Q5oY53AOQuNTOpdH7XDE90lblTQ==");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash", "Role", "Username" },
                values: new object[] { 2, "kagankaramazov@gmail.com", "AQAAAAIAAYagAAAAEHmN1xxssFNGJx4QQrU9XmGRNGYn3VoozWwSsZLFSoV+TCHtOvZHhivMnutiRsyjMA==", 1, "moderator.id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEIOYZbkXhZ5JyBssB/1vS30gTqp0YD6srCH5qqDlDOjKDc3gH6gPVLNqPH3kBqyQ9w==");
        }
    }
}
