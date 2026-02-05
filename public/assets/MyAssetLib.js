var base_url=$("#base_url").val();
//alert(base_url);
$(document).ready(function() {
   $("#FrimName").select2({
  });
});
//serial key autocompltet
$(document).ready(function () {
  // Handle form submission
  $('#serialnumber').on('input', function (e) {
    e.preventDefault(); // Prevent form submit until checks are done

    
    let serial = $('#serialnumber').val().trim();

    if (serial.length > 0) {
     $.ajax({
        url: base_url +'Customer_SerialKey',
        type: 'POST',
        data: { DB_Cust__SerialKey: serial },
        dataType: 'json',
        async: false, // Important: make synchronous for this case
        success: function (response) {
          
          if (response.response=='true') {
            $('#serialnumber_error').text('Serial number already exists.');
            $('#serialnumber').focus();
          }else{  
              $('#serialnumber_error').text('');  
          }
        }
      });
    }


  });
});
//customer Details 
/***************************************************************Customer Details Tables ********************************************************** */
//customer feedback status table Customer Details calling data
$( document ).ready(function() {
  
    var table = $('#multi-filter-select').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "myCustomerTable",
      columns: [
        {
          data: null,
          title: "#",
          render: function (data, type, row, meta) {
            return meta.row + meta.settings._iDisplayStart + 1;
          }
        },
          
          { title: "Firm Name", data: 'DB_Cust__FirmName' },
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Address", data: 'DB_Cust__Address' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          
          { title: "Payment Status", data: 'DB_Cust__SathiPaymentStatus' },
          { title: "Lead Status", data: 'DB_Cust__SathiCurrentStatus' },
          { title: "Installation Date", data: 'DB_Cust__InstalltionDate' },
          { title: "Next AMC Date", data: 'DB_Cust__NextAMCDate' },
          { title: "AMC Expired", data: 'DB_Cust__AMCExpired' },
          { title: "Created By (User ID)", data: 'DB_Cust__UserId' },
          { title: "Last Updated By", data: 'DB_Cust__LastUpdateUserId' },
          { title: "Last Updated Date", data: 'DB_Cust__LastUpdateDate' },
          { title: "Status", data: 'DB_Cust__Status' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});
//open model details to display with only keys
function openCustomerModalWithKeys(customerId){
  // Clear previous modal content
    $('#customerModalBody').html('<p>Loading...</p>');
    
    // Show the modal
    $('#customerModal').modal('show');

    // Fetch customer details via AJAX
    $.ajax({
      url: base_url + 'Customer-get-Details/' + customerId,
      type: 'POST',
      dataType: 'json',
      success: function (response) {
         let data = response.data[0];
        if (data) {
          
          let html = `
                  <div class="row">
                    <div class="col-md-6 col-lg-6">
                      <span><strong>Firm Name:</strong> ${data.DB_Cust__FirmName || 'NA'}</span><br>
                      <span><strong>Customer Name:</strong> ${data.DB_Cust__Name || 'NA'}</span><br>
                      <span><strong>Mobile No:</strong> ${data.DB_Cust__MobileNo || 'NA'}</span><br>
                      <span><strong>State:</strong> ${data.DB_Cust__State || 'NA'}</span><br>
                      <span><strong>Serial Key:</strong> ${data.DB_Cust__SerialKey || 'NA'}</span><br>
                      <span><strong>Partner Name:</strong> ${data.PartnerName || 'NA'}</span><br>
                      <span><strong>Address:</strong> ${data.DB_Cust__Address || 'NA'}</span><br>
                    </div>

                    <div class="col-md-6 col-lg-6">
                      <span><strong>Voucher Type:</strong> ${data.DB_VoucherType || 'NA'}</span><br>
                      <span><strong>Sale Key:</strong> ${data.DB_Api__SaleKey || 'NA'}</span><br>
                      <span><strong>Purchase Key:</strong> ${data.DB_Api__PurchaseKey || 'NA'}</span><br>
                      <span><strong>Payment Key:</strong> ${data.DB_Api__PaymentKey || 'NA'}</span><br>
                      <span><strong>Receipt Key:</strong> ${data.DB_Api__ReciptKey || 'NA'}</span><br>
                      <span><strong>Debit Note Key:</strong> ${data.DB_Api__DebitNoteKey || 'NA'}</span><br>
                      <span><strong>Credit Note Key:</strong> ${data.DB_User__CreditNoteKey || 'NA'}</span><br>
                      <span><strong>API Key:</strong> ${data.DB_ApiKey || 'NA'}</span><br>
                    </div>
                  </div>
                `;

          $('#customerModalBody').html(html);
        } else {
          $('#customerModalBody').html('<p>No data found.</p>');
        }
      },
      error: function () {
        $('#customerModalBody').html('<p class="text-danger">Error loading data.</p>');
      }
    });
}
  function openCustomerModal(customerId) {
    // Clear previous modal content
    $('#customerModalBody').html('<p>Loading...</p>');
    
    // Show the modal
    $('#customerModal').modal('show');

    // Fetch customer details via AJAX
    $.ajax({
      url: base_url + 'Customer-get-Details/' + customerId,
      type: 'POST',
      dataType: 'json',
      success: function (response) {
         let data = response.data[0];
        if (data) {
          // Format "Next AMC Date" with color if expiring within 30 days
            let nextAMCText = 'NA';

            if (data.DB_Cust__NextAMCDate) {
              const amcDate = new Date(data.DB_Cust__NextAMCDate);
              const today = new Date();

              // Calculate days difference
              const diffTime = amcDate - today;
              const diffDays = diffTime / (1000 * 60 * 60 * 24);

              // Format the date nicely
              const formattedDate = amcDate.toLocaleDateString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              });

              // Apply color based on condition
              if (diffDays <= 30) {
                // Expiring soon or expired
                nextAMCText = `<span style="color:red;">${formattedDate}</span>`;
              } else {
                // Still valid
                nextAMCText = `<span style="color:green;">${formattedDate}</span>`;
              }
            }
          let html = `
                  <div class="row">
                    <div class="col-md-6 col-lg-6">
                      <span><strong>Firm Name:</strong> ${data.DB_Cust__FirmName || 'NA'}</span><br>
                      <span><strong>Customer Name:</strong> ${data.DB_Cust__Name || 'NA'}</span><br>
                      <span><strong>Mobile No:</strong> ${data.DB_Cust__MobileNo || 'NA'}</span><br>
                      <span><strong>State:</strong> ${data.DB_Cust__State || 'NA'}</span><br>
                      <span><strong>Serial Key:</strong> ${data.DB_Cust__SerialKey || 'NA'}</span><br>
                      <span><strong>Partner Name:</strong> ${data.PartnerName || 'NA'}</span><br>
                      <span><strong>Address:</strong> ${data.DB_Cust__Address || 'NA'}</span><br>
                    </div>

                    <div class="col-md-6 col-lg-6">
                      <span><strong>Voucher Type:</strong> ${data.DB_VoucherType || 'NA'}</span><br>
                      <span><strong>Sale Key:</strong> ${data.DB_Api__SaleKey || 'NA'}</span><br>
                      <span><strong>Purchase Key:</strong> ${data.DB_Api__PurchaseKey || 'NA'}</span><br>
                      <span><strong>Payment Key:</strong> ${data.DB_Api__PaymentKey || 'NA'}</span><br>
                      <span><strong>Receipt Key:</strong> ${data.DB_Api__ReciptKey || 'NA'}</span><br>
                      <span><strong>Debit Note Key:</strong> ${data.DB_Api__DebitNoteKey || 'NA'}</span><br>
                      <span><strong>Credit Note Key:</strong> ${data.DB_User__CreditNoteKey || 'NA'}</span><br>
                      <span><strong>API Key:</strong> ${data.DB_ApiKey || 'NA'}</span><br>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 col-lg-6">
                      <span><strong>AMC Expired :</strong> ${data.DB_Cust__AMCExpired == 0 ? 'Expired' : 'Active'}</span><br>
                      <span><strong>Customer Status:</strong> ${data.DB_Cust__SathiCurrentStatus || 'NA'}</span><br>
                      <span><strong>Payment Status:</strong> ${data.DB_Cust__SathiPaymentStatus == 'R' ? 'Received' : 'Pending'}</span><br>
                      <span><strong>Total Demo Count:</strong> ${data.Total_Demo_Count || 'NA'}</span><br>
                    </div>

                    <div class="col-md-6 col-lg-6">
                      <span><strong>Next AMC Date:</strong> ${nextAMCText || 'NA'}</span><br>
                      <span><strong>Lead Register Date:</strong> ${data.DB_Cust__LeadDate || 'NA'}</span><br>
                      <span><strong>Demo Register Date:</strong> ${data.DB_User__DemoDate || 'NA'}</span><br>
                      <span><strong>Activation Date:</strong> ${data.DB_User__LetusActivationDate || 'NA'}</span><br>
                    </div>
                  </div>
                `;

          $('#customerModalBody').html(html);
        } else {
          $('#customerModalBody').html('<p>No data found.</p>');
        }
      },
      error: function () {
        $('#customerModalBody').html('<p class="text-danger">Error loading data.</p>');
      }
    });
  }

  // Optional: when modal closes, clear its content to avoid leftover data
  $('#customerModal').on('hidden.bs.modal', function () {
    $('#customerModalBody').html('');
  });

//customer AMC Expired Details
$( document ).ready(function() {
  
    var table = $('#multi-filter-select-AMC-Expired').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "myCustomerAMCExpiredTable",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Address", data: 'DB_Cust__Address' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          { title: "Next AMC Date", data: 'DB_Cust__NextAMCDate' },
          { title: "AMC Expired", data: 'DB_Cust__AMCExpired' },
          { title: "Days", data: 'DB_HowMuchDays' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});
//customer AMC before 30 days Expired Details
$( document ).ready(function() {
  
    var table = $('#multi-filter-select-AMC-Expired-30Days').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "AMCExpiredthirtydaysCustomer",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Address", data: 'DB_Cust__Address' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          { title: "Next AMC Date", data: 'DB_Cust__NextAMCDate' },
          { title: "AMC Expired", data: 'DB_Cust__AMCExpired' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});
// multi-filter-select-CustomerActive
$( document ).ready(function() {
  
    var table = $('#multi-filter-select-CustomerActive').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "ActivationCustomerTable",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },  
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: "Address", data: 'DB_Cust__Address' },          
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "API Key", data: 'DB_ApiKey' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          { title: "Lead Date", data: 'DB_Cust__LeadDate' },
          { title: "Demo Date", data: 'DB_User__DemoDate' },
          { title: "Activatation Date", data: 'DB_User__LetusActivationDate' },
          { title: "Lead Days", data: 'DB_lead_Days' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});

//customer lead table calling data
$( document ).ready(function() {
  
    var table = $('#multi-filter-select-CustomerLead').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "CLeadTable",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },  
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: "Address", data: 'DB_Cust__Address' },          
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          { title: "Lead Date", data: 'DB_Cust__LeadDate' },
          { title: "Lead Days", data: 'DB_lead_Days' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});

//Demo customer details calling data
$(document).ready(function() {
  // Detect dropdown change
  $('#CustomerID').on('change', function() {
    var customerId = $(this).val();

    if (customerId) {
      // Call AJAX API
      $.ajax({
        url: base_url + "Customer-Profile",   // your API endpoint
        type: 'POSt',                      // or 'POST'
        data: { id: customerId },         // data sent to backend
        dataType: 'json',
        success: function(response) {
          let data = response.data[0]; // access first object in array
           // Handle the response (e.g., populate fields)
          $('#Customer-Profile-Details').html(
            '<span><strong>Frim Name:</strong> ' + (data.DB_Cust__FirmName || 'NA') + '</span><br>' +
            '<span><strong>Customer Name:</strong> ' + (data.DB_Cust__Name || 'NA') + '</span><br>' +
            '<span><strong>Mobile No:</strong> ' + (data.DB_Cust__MobileNo || 'NA') + '</span><br>' +
            '<span><strong>State:</strong> ' + (data.DB_Cust__State || 'NA') + '</span><br>' +
            '<span><strong>Serial Key:</strong> ' + (data.DB_Cust__SerialKey || 'NA') + '</span><br>' +
            '<span><strong>Partner Name:</strong> ' + (data.PartnerName || 'NA') + '</span><br>' +
            '<span><strong>Address:</strong> ' + (data.DB_Cust__Address || 'NA')
          );
        },
        error: function(xhr, status, error) {
          console.error('Error fetching data:', error);
          $('#customerDetails').html('<span style="color:red;">Failed to load data</span>');
        }
      });
    } else {
      // Clear if no customer selected
      $('#Customer-Profile-Details').empty();
    }
  });
});
//Activation customer details calling data
$(document).ready(function() {
  // Detect dropdown change
  $('#CustomerIDAct').on('change', function() {
    var customerId = $(this).val();

    if (customerId) {
      // Call AJAX API
      $.ajax({
        url: base_url + "Customer-Profile-Activation",   // your API endpoint
        type: 'POSt',                      // or 'POST'
        data: { id: customerId },         // data sent to backend
        dataType: 'json',
        success: function(response) {
          let data = response.data[0]; // access first object in array
           // Handle the response (e.g., populate fields)
          $('#Customer-Profile-Details').html(
            '<span><strong>Frim Name:</strong> ' + (data.DB_Cust__FirmName || 'NA') + '</span><br>' +
            '<span><strong>Customer Name:</strong> ' + (data.DB_Cust__Name || 'NA') + '</span><br>' +
            '<span><strong>Mobile No:</strong> ' + (data.DB_Cust__MobileNo || 'NA') + '</span><br>' +
            '<span><strong>State:</strong> ' + (data.DB_Cust__State || 'NA') + '</span><br>' +
            '<span><strong>Serial Key:</strong> ' + (data.DB_Cust__SerialKey || 'NA') + '</span><br>' +
            '<span><strong>Partner Name:</strong> ' + (data.PartnerName || 'NA') + '</span><br>' +
            '<span><strong>P. Mobile No.:</strong> ' + (data.DB_Cust__ParntnerMobileNo || 'NA') + '</span><br>' +
            '<span><strong>Address:</strong> ' + (data.DB_Cust__Address || 'NA')
          );
          $('#Customer-Apikeys-Details').html(
            '<span><strong>Voucher Type:</strong> ' + (data.DB_VoucherType || 'NA') + '</span><br>' +
            '<span><strong>Sale Key:</strong> ' + (data.DB_Api__SaleKey || 'NA') + '</span><br>' +
            '<span><strong>Purchase Key:</strong> ' + (data.DB_Api__PurchaseKey || 'NA') + '</span><br>' +
            '<span><strong>Payment Key:</strong> ' + (data.DB_Api__PaymentKey || 'NA') + '</span><br>' +
            '<span><strong>Receipt Key:</strong> ' + (data.DB_Api__ReciptKey || 'NA') + '</span><br>' +
            '<span><strong>Debit Note Key:</strong> ' + (data.DB_Api__DebitNoteKey || 'NA') + '</span><br>' +
            '<span><strong>Crdit Note Key:</strong> ' + (data.DB_User__CreditNoteKey || 'NA') + '</span><br>' +
            '<span><strong>API Key:</strong> ' + (data.DB_ApiKey || 'NA')
          );
           if (data.DB_Cust__NextAMCDate) {
            let nextAmcDate = new Date(data.DB_Cust__NextAMCDate);
            let currentDate = new Date();

           if (nextAmcDate <= currentDate && data.DB_Cust__AMCExpired !== '1' && parseInt(data.Total_Demo_Count) < 2) {
                 $('#Customer-Demo-Extends').html(
                  '<input type="hidden" id="DB_ApiKeyId" value="' + data.DB_ApiKeyId  + '"><button class="btn btn-success" id="demoExtended">Extend Demo</button>'
                );
          } else {
            // Optional: clear or disable demo button if conditions not met
            $('#Customer-Demo-Extends').empty();
          } 

          }
        },
        error: function(xhr, status, error) {
          console.error('Error fetching data:', error);
          $('#customerDetails').html('<span style="color:red;">Failed to load data</span>');
          $('#Customer-Apikeys-Details').html('<span style="color:red;">Failed to load data</span>');
        }
      });
    } else {
      // Clear if no customer selected
      $('#Customer-Profile-Details').empty();
      $('#Customer-Apikeys-Details').empty();
    }
  });
});
//customer Demo extended
$(document).on('click', '#demoExtended', function() {

  var customerId = $('#CustomerIDAct').val();
  var DB_ApiKeyId = $('#DB_ApiKeyId').val();

  $.ajax({
    url: base_url + "Customer-Demo-Extend", // your API endpoint
    type: 'POST',
    data: { 
      DB_Cust__Id: customerId,
      DB_ApiKeyId: DB_ApiKeyId
    },
    dataType: 'json',
    success: function(response) {
      alert(JSON.stringify(response));
      alert(response.success);
      if (response.success === true) {
        Swal.fire({
          title: 'Success!',
          text: 'Demo extended successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#28a745'
        }).then(() => {
          location.reload(); // reload after user clicks OK
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: response.message || 'Failed to extend demo.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    error: function(xhr, status, error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        title: 'Server Error!',
        text: 'Something went wrong while extending the demo.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });

});

//customer Demo table calling data
$( document ).ready(function() {
  
    var table = $('#Table_Demo_Customer_Data').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "CDemoTable",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },
          { title: "Customer Name", data: 'DB_Cust__Name' },          
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: "Address", data: 'DB_Cust__Address' },
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "API Key", data: 'DB_ApiKey' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          { title: "Demo Date", data: 'DB_User__DemoDate' },
          { title: "Lead Days", data: 'DB_lead_Days' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});
//customer Live table calling data
$( document ).ready(function() {
  
    var table = $('#multi-filter-select-CustomerLive').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "CLiveTable",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },  
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Address", data: 'DB_Cust__Address' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          { title: "Status", data: 'DB_Cust__Status' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});

//Customer Payment Recived table calling data
$( document ).ready(function() {
  
    var table = $('#multi-filter-select-CustomerPaymentRecived').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "CPReciviedTable",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },  
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Address", data: 'DB_Cust__Address' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' },
          { title: "Payment Recived Date", data: 'DB_User__LetusActivationDate' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});

//customer Payment Pending table calling data
$( document ).ready(function() {
  
    var table = $('#multi-filter-select-CustomerPaymentPending').dataTable({
      pageLength: 10,
      responsive: true,
      bProcessing: true,
      bPaginate: true,
      sPaginationType: "full_numbers",
      bAutoWidth: true,
      fixedColumns: true,
      ajax: base_url + "CPPendingTable",
      columns: [
        
          { title: "Firm Name", data: 'DB_Cust__FirmName' },  
          { title: "Customer Name", data: 'DB_Cust__Name' },
          { title: "Address", data: 'DB_Cust__Address' },
          { title: "Mobile Number", data: 'DB_Cust__MobileNo' },
          { title: 'City', data: 'DB_Cust__city'},
          { title: "State", data: 'DB_Cust__State' },
          { title: "Serial Key", data: 'DB_Cust__SerialKey' },
          { title: "Partner Name", data: 'DB_Cust__ParntnerNo' }
      ],
      initComplete: function () {
        // Add select filters to each column in the footer
        this.api().columns().every(function () {
          var column = this;
          var select = $('<select class="form-select"><option value=""></option></select>')
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column.data().unique().sort().each(function (d, j) {
            // Avoid undefined values
            if (d !== null && d !== undefined && d !== "") {
              select.append('<option value="' + d + '">' + d + "</option>");
            }
          });
        });
      }
        
    });
    
});

//employee table calling data
$(document).ready(function () {
  const isSuperAdmin = $('#user_Role').val() === 'SuperAdmin';

  const commonColumns = [
    {
      data: null,
      title: "#",
      render: function (data, type, row, meta) {
        return meta.row + meta.settings._iDisplayStart + 1;
      }
    },
    { title: "Employee Name", data: 'DB_UserName' },
    { title: "Email Id", data: 'DB_UserEmailId' },
    { title: "Mobile Number", data: 'DB_UserMobileNo' },
    { title: "Designation", data: 'DB_Designation' },
    { title: "Employee Role", data: 'DB_UserRole' },
    { title: "Profile", data: 'DB_UserProfile' },
    { title: "User Id", data: 'DB_User__ID' },
    { title: "Last Update", data: 'DB_User__LastUpdateId' },
    { title: "Date", data: 'DB_User__CurrentDate' },
    { title: "Last Update Date", data: 'DB_User__LastUpdateDate' },
    { title: "Status", data: 'DB_UserStatus' }
  ];

  if (isSuperAdmin) {
    commonColumns.splice(2, 0, { title: "Employee Password", data: 'DB_User__Password' });
  }

  $('#multi-filter-select-EmployeePartner').DataTable({
    pageLength: 10,
    responsive: true,
    bProcessing: true,
    bPaginate: true,
    sPaginationType: "full_numbers",
    bAutoWidth: true,
    fixedColumns: true,
    ajax: base_url + "myEmployeeTable",
    columns: commonColumns,
    initComplete: function () {
      this.api().columns().every(function () {
        const column = this;
        const select = $('<select class="form-select"><option value=""></option></select>')
          .appendTo($(column.footer()).empty())
          .on("change", function () {
            const val = $.fn.dataTable.util.escapeRegex($(this).val());
            column.search(val ? "^" + val + "$" : "", true, false).draw();
          });

        column.data().unique().sort().each(function (d) {
          if (d !== null && d !== undefined && d !== "") {
            select.append('<option value="' + d + '">' + d + "</option>");
          }
        });
      });
    }
  });
});
//change employee status active / inactive
function changeEmployeeStatus(status, userId, actionText) {
    Swal.fire({
        title: `Are you sure you want to ${actionText}?`,
        text: `This will ${actionText.toLowerCase()} the employee's access.`,
        icon: actionText === 'Activate' ? 'success' : 'warning',
        showCancelButton: true,
        confirmButtonColor: actionText === 'Activate' ? '#28a745' : '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${actionText}`,
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: base_url + "ChangeEmployeeStatusAPI", 
                type: 'POST',
                dataType: 'json',
                data: {
                    userId: userId,
                    status: status,
                },
                success: function (response) {
                    if (response.success) {
                        Swal.fire('Success!', response.message, 'success').then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Error!', response.message, 'error');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('AJAX error:', error);
                    Swal.fire('Error!', 'Something went wrong.', 'error');
                }
            });
        }
    });
}
//change Customer status active / inactive
function changeCustomerStatus(status, userId, actionText) {
      Swal.fire({
        title: `Are you sure you want to ${actionText}?`,
        text: `This will ${actionText.toLowerCase()} the Customer's access.`,
        icon: actionText === 'Activate' ? 'success' : 'warning',
        showCancelButton: true,
        confirmButtonColor: actionText === 'Activate' ? '#28a745' : '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${actionText}`,
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: base_url + "ChangeCustomerStatusAPI", 
                type: 'POST',
                dataType: 'json',
                data: {
                    userId: userId,
                    status: status,
                },
                success: function (response) {
                    if (response.success) {
                        Swal.fire('Success!', response.message, 'success').then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Error!', response.message, 'error');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('AJAX error:', error);
                    Swal.fire('Error!', 'Something went wrong.', 'error');
                }
            });
        }
    });
}
//Activated Customer status active / inactive
function changeActiveCustomerStatus(status, userId, actionText) {
      Swal.fire({
        title: `Are you sure you want to ${actionText}?`,
        text: `This will ${actionText.toLowerCase()} the Customer's access.`,
        icon: actionText === 'Activate' ? 'success' : 'warning',
        showCancelButton: true,
        confirmButtonColor: actionText === 'Activate' ? '#28a745' : '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${actionText}`,
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: base_url + "ChangeActiveCustomerStatusAPI", 
                type: 'POST',
                dataType: 'json',
                data: {
                    userId: userId,
                    status: status,
                },
                success: function (response) {
                    if (response.success) {
                        Swal.fire('Success!', response.message, 'success').then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Error!', response.message, 'error');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('AJAX error:', error);
                    Swal.fire('Error!', 'Something went wrong.', 'error');
                }
            });
        }
    });
}

//**************************************************************************** */

//Activation Customer Updates API Key fields based on Voucher Type selection
$(document).ready(function() {
    // 1. Target the form submission
    $('#formIdU').submit(function(e) {
        let formValid = true;

        // 2. Get the multiple select field
        let $voucherSelect = $('#VoucherType');
        
        // Count how many options are selected
        let selectedCount = $voucherSelect.val() ? $voucherSelect.val().length : 0;
        
        // 3. Find the existing error span (from your HTML: form_error('VoucherType[]'))
        let $errorSpan = $('span[style="color:red;"]').filter(function() {
            // Find the span associated with the VoucherType field
            return $(this).prev('small').length > 0 && $(this).prev('small').text().includes('multiple options');
        });

        // 4. Check if at least one option is selected
        if (selectedCount === 0) {
            // Prevent form submission
            e.preventDefault();
            formValid = false;

            // Display the error message
            if ($errorSpan.length) {
                $errorSpan.text('The Voucher Type field is required.');
            } else {
                // Fallback: append error message if the PHP span isn't found
                $voucherSelect.after('<span class="jquery-error" style="color:red;">The Voucher Type field is required.</span>');
            }
            
            // Highlight the field (optional)
            $voucherSelect.addClass('is-invalid');
        } else {
            // Validation passed for this field
            if ($errorSpan.length) {
                $errorSpan.text(''); // Clear the error message
            }
            $voucherSelect.removeClass('is-invalid');
        }
        
        // Note: You should ideally combine this with client-side checks for all required fields.
        
        if (!formValid) {
            // Scroll to the error message or field if submission was blocked
            $('html, body').animate({
                scrollTop: $voucherSelect.offset().top - 100
            }, 500);
        }

        // Return formValid to control submission
        return formValid;
    });

    // 5. Clear error when user interacts with the dropdown
    $('#VoucherType').change(function() {
        let $select = $(this);
        let selectedCount = $select.val() ? $select.val().length : 0;
        let $errorSpan = $select.siblings('span[style="color:red;"]');

        if (selectedCount > 0) {
            $errorSpan.text('');
            $select.removeClass('is-invalid');
            // Remove the fallback jQuery error if it exists
            $select.siblings('.jquery-error').remove();
        }
    });
});
//Activate customer jQuery validation for the multiple select field
 $(document).ready(function() {
    // 1. Target the form submission
    $('#formId').submit(function(e) {
        let formValid = true;

        // 2. Get the multiple select field
        let $voucherSelect = $('#VoucherType');
        
        // Count how many options are selected
        let selectedCount = $voucherSelect.val() ? $voucherSelect.val().length : 0;
        
        // 3. Find the existing error span (from your HTML: form_error('VoucherType[]'))
        let $errorSpan = $('span[style="color:red;"]').filter(function() {
            // Find the span associated with the VoucherType field
            return $(this).prev('small').length > 0 && $(this).prev('small').text().includes('multiple options');
        });

        // 4. Check if at least one option is selected
        if (selectedCount === 0) {
            // Prevent form submission
            e.preventDefault();
            formValid = false;

            // Display the error message
            if ($errorSpan.length) {
                $errorSpan.text('The Voucher Type field is required.');
            } else {
                // Fallback: append error message if the PHP span isn't found
                $voucherSelect.after('<span class="jquery-error" style="color:red;">The Voucher Type field is required.</span>');
            }
            
            // Highlight the field (optional)
            $voucherSelect.addClass('is-invalid');
        } else {
            // Validation passed for this field
            if ($errorSpan.length) {
                $errorSpan.text(''); // Clear the error message
            }
            $voucherSelect.removeClass('is-invalid');
        }
        
        // Note: You should ideally combine this with client-side checks for all required fields.
        
        if (!formValid) {
            // Scroll to the error message or field if submission was blocked
            $('html, body').animate({
                scrollTop: $voucherSelect.offset().top - 100
            }, 500);
        }

        // Return formValid to control submission
        return formValid;
    });

    // 5. Clear error when user interacts with the dropdown
    $('#VoucherType').change(function() {
        let $select = $(this);
        let selectedCount = $select.val() ? $select.val().length : 0;
        let $errorSpan = $select.siblings('span[style="color:red;"]');

        if (selectedCount > 0) {
            $errorSpan.text('');
            $select.removeClass('is-invalid');
            // Remove the fallback jQuery error if it exists
            $select.siblings('.jquery-error').remove();
        }
    });
});
$(document).ready(function() {
    // Mapping of Voucher Type values to their corresponding API Key field IDs
    const voucherToApiKeyMap = {
        'Sales': '#SaleApiKey',
        'Purchase': '#PurchaseApiKey',
        'Credit Note': '#CreditNoteApiKey',
        'Debit Note': '#DebitNoteApiKey',
        'Payment': '#PaymentApiKey',
        'Receipt': '#ReceiptApiKey'
    };
    
    // The main "Voucher Type" multiple-select element
    const voucherSelect = $('#VoucherType');
    
    // API Key input fields you want to control
    // The general 'ApiKey' input is NOT included here, as it may be for overall use.
    const individualApiKeyFields = [
        '#SaleApiKey', '#PurchaseApiKey', '#CreditNoteApiKey', 
        '#DebitNoteApiKey', '#PaymentApiKey', '#ReceiptApiKey'
    ];

    function updateApiKeyFieldsState() {
        // Get an array of all currently selected voucher values (e.g., ['Sales', 'Payment'])
        const selectedVouchers = voucherSelect.val() || [];
        
        // Loop through the map to check each API field
        for (const voucherType in voucherToApiKeyMap) {
            if (voucherToApiKeyMap.hasOwnProperty(voucherType)) {
                const apiKeyFieldID = voucherToApiKeyMap[voucherType];
                const $apiKeyField = $(apiKeyFieldID);

                // Check if the current specific voucher type is in the list of selected vouchers
                const isVoucherSelected = selectedVouchers.includes(voucherType);

                if (isVoucherSelected) {
                    // If the specific voucher is selected, REMOVE READONLY and restore placeholder
                    $apiKeyField.prop('readonly', false);
                    // Restore original placeholder (optional, but helpful)
                    $apiKeyField.attr('placeholder', 'Enter ' + voucherType + ' Api Key'); 
                } else {
                    // If the specific voucher is NOT selected, ADD READONLY, clear value, and set placeholder
                    $apiKeyField.prop('readonly', true);
                    $apiKeyField.val(''); // Clear the value when it becomes read-only
                    $apiKeyField.attr('placeholder', 'Select ' + voucherType + ' to enable');
                }
            }
        }
        
        // You might want a specific rule for the generic #ApiKey field (not done here, 
        // but if you want it editable only if at least one voucher is selected, you'd add that check here).
    }

    // 1. Attach the event listener to the VoucherType select box
    voucherSelect.on('change', updateApiKeyFieldsState);

    // 2. Call the function on page load to set the initial state
    updateApiKeyFieldsState();
});