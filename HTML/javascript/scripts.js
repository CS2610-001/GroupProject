<script type="text/javascript">
function saveData(){
  var emailAddress;
  var biography;
  emailAddress = document.getElementById("email").value;
  biography = document.getElementById("bio").value;

  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAddress)){
    alert("SAVED")
  }	else{
    document.getElementById("email").value = "user@domain.tld";
    alert("You have entered an invalid email address!")

  }
  document.getElementById("bio").value = biography;
}

function logout(){
  alert("You have logged out. But not really cuz this button is broke.")
}

function search(){
  var searchItem = document.getElementById("searchValue").value;
  while(searchItem.charAt(0) === '#'){
    searchItem = searchItem.substr(1);
  }
}
</script>
