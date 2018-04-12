$.validator.setDefaults({
	highlight: (element) => {
		$(element).closest(".form-group").addClass('has-error');
	},
	unhighlight: (element) => {
		$(element).closest(".form-group").removeClass("has-error");
	},
	errorElement: "span",
	errorClass: "text-danger",
	errorPlacement: (err, element) => {
		if(element.parent(".input-group").length){
			err.insertAfter(element.parent());
		}else{
			err.insertAfter(element);
		}
	}
});

$(".form-validate").validate();