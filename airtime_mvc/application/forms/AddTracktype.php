<?php

class Application_Form_AddTracktype extends Zend_Form
{

    public function init()
    {
        $notEmptyValidator = Application_Form_Helper_ValidationTypes::overrideNotEmptyValidator();

        $this->setAttrib('id', 'tracktype_form');

        $hidden = new Zend_Form_Element_Hidden('tracktype_id');
        $hidden->setDecorators(array('ViewHelper'));
        $this->addElement($hidden);

        $this->addElement('hash', 'csrf', array(
           'salt' => 'unique'
        ));

        $typeName = new Zend_Form_Element_Text('type_name');
        $typeName->setLabel(_('Type Name:'));
        $typeName->setAttrib('class', 'input_text');
        $typeName->addFilter('StringTrim');
        $this->addElement($typeName);

        $code = new Zend_Form_Element_Text('code');
        $code->setLabel(_('Code:'));
        $code->setAttrib('class', 'input_text');
        $code->setAttrib('style', 'width: 40%');
        $code->setRequired(true);
        $code->addValidator($notEmptyValidator);
        $code->addFilter('StringTrim');
        $this->addElement($code);

        $description = new Zend_Form_Element_Textarea('description');
        $description->setLabel(_('Description:'))
            ->setFilters(array('StringTrim'))
            ->setValidators(array(
                new Zend_Validate_StringLength(array('max' => 200))
            ));
        $description->setAttrib('class', 'input_text');
        $description->addFilter('StringTrim');
        $this->addElement($description);

        $visibility = new Zend_Form_Element_Select('visibility');
        $visibility->setLabel(_('Visibility:'));
        $visibility->setAttrib('class', 'input_select');
        $visibility->setAttrib('style', 'width: 40%');
        $visibility->setMultiOptions(array(
                "0" => _("Disabled"),
                "1" => _("Enabled")
            ));
        //$visibility->getValue();
        $visibility->setRequired(true);
        $this->addElement($visibility);

        $saveBtn = new Zend_Form_Element_Button('save_tracktype');
        $saveBtn->setAttrib('class', 'btn right-floated');
        $saveBtn->setIgnore(true);
        $saveBtn->setLabel(_('Save'));
        $this->addElement($saveBtn);
    }

    public function validateCode($data)
    {
        if (strlen($data['tracktype_id']) == 0) {
            $count = CcTracktypesQuery::create()->filterByDbCode($data['code'])->count();

            if ($count != 0) {
                $this->getElement('code')->setErrors(array(_("Code is not unique.")));

                return false;
            }
        }

        return true;
    }

}
