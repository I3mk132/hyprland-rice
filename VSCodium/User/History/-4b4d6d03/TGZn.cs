using System.Dynamic;
using System.Runtime.InteropServices.Marshalling;

namespace Paswordy.Core.Objects;

public class Record
{
    public Guid Id {get; set;}
    public Guid UserId {get;set;}
    public string Title {get;set;}
    public string? Username {get;set;}
    public string? Email {get;set;}
    public string Password {get;set;}
    public string? Url {get;set;}
    public DateTime? CreatedAt {get;set;}
    private enum enMode {AddNew, Update}
    private enMode _Mode;

    public Record (Guid UserId, string Title = "", string Username = "", string Email = "", string Password = "", string Url = "", DateTime? CreatedAt = null){
        this.UserId = UserId;
        this.Title = Title;
        this.Username = Username;
        this.Email = Email;
        this.Password = Password;
        this.Url = Url;
        this.CreatedAt = CreatedAt ?? DateTime.Now;
        this._Mode = enMode.AddNew;
    }



}