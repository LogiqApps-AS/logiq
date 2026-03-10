using Logiq.Api.Models;

namespace Logiq.Api.Storage;

public interface IEmployeeRepository
{
    Task<IReadOnlyList<Employee>> ListByTeamAsync(string teamId, CancellationToken cancellationToken = default);
    Task<Employee?> GetByIdAsync(string teamId, string employeeId, CancellationToken cancellationToken = default);
    Task UpsertAsync(string teamId, Employee employee, CancellationToken cancellationToken = default);
}
