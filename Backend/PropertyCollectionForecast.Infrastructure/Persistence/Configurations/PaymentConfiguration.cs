namespace PropertyCollectionForecast.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PropertyCollectionForecast.Domain.Entities;

public sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PaymentDate).HasColumnType("date");
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.Reference).HasMaxLength(100);

        builder.HasOne(x => x.Contract)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.ContractId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
