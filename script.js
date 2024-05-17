const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const 
    formOpenBtn = $('.loginbtn'),
    formcloseBtn = $('.icon-close'),
    register = $('.register'),
    login = $('.login'),
    modal = $('.modal'),
    modalBody = $('.modal__body')

formOpenBtn.addEventListener('click', () => modal.classList.add('show'))
formcloseBtn.addEventListener('click', () =>modal.classList.remove('show'))

register.addEventListener('click', (e) => {
    e.preventDefault();
    modalBody.classList.add('active');
})

login.addEventListener('click', (e) => {
    e.preventDefault();
    modalBody.classList.remove('active');
})

// Đối tượng Validator
function Validator(options){

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}

    // Hàm thực hiện validate
    function validate(inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage 

        
        //Lấy ra các rules cuae selector
        var rules = selectorRules[rule.selector];

        console.log(rules);

        // Lặp qua từng rule
        for(var i = 0; i < rules.length; ++i){
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage;
    }

    // Lấy element của form
    var formElement = document.querySelector(options.form);
    
    if (formElement) {
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;

            //Lặp qua từng rules và validate
            options.rules.forEach(function (rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            

            console.log(formValues);

            if (isFormValid){
                //Trường hợp submit vs java
                if (typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value;
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                
                // Trường hợp submit 
                } else {
                    formElement.submit();
                }
            }

        }
        
        options.rules.forEach(function (rule){
            
            // Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            
            if (inputElement) {
                // xứ lí trường hợp blur khỏi input
                inputElement.onblur = function(){
                    validate(inputElement, rule);
                }

                //Xử lí mỗi khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        }); 
    }
}

// Dinh nghia rules
// Nguyen tac cua cac rule:
// 1. Khi có lỗi => Trả ra messae lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undifined)
Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            return value.trim() ? undefined : message || 'Vui lòng nhập trường hợp này'
        }
    };
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            var regax = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regax.test(value) ? undefined : message || 'Trường này phải là email';
        }
    };
}

Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Tối thiểu ${min} kí tự`;
        }
    };
} 

Validator.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function(value){
            return value == getConfirmValue() ? undefined : message || 'Giá trị không chính xác';
        }
    };
} 