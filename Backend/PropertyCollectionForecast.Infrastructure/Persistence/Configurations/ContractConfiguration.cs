namespace PropertyCollectionForecast.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PropertyCollectionForecast.Domain.Entities;

public sealed class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.ToTable("Contracts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ContractValue).HasPrecision(18, 2);
        builder.Property(x => x.DownPaymentPercentage).HasPrecision(18, 2);
        builder.Property(x => x.DownPaymentAmount).HasPrecision(18, 2);
        builder.Property(x => x.ContractDate).HasColumnType("date");
        builder.Property(x => x.FirstInstallmentDate).HasColumnType("date");
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

        builder.HasOne(x => x.Customer)
            .WithMany(x => x.Contracts)
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Unit)
            .WithMany(x => x.Contracts)
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
