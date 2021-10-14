<?php

class Application_Form_ShowListenerStat extends Zend_Form_SubForm
{
    public function init()
    {
        $this->setDecorators([
            ['ViewScript', ['viewScript' => 'form/daterange.phtml']],
        ]);

        // Add start date element
        $startDate = new Zend_Form_Element_Text('his_date_start');
        $startDate->class = 'input_text';
        $startDate->setRequired(true)
            ->setLabel(_('Date Start:'))
            ->setValue(date('Y-m-d'))
            ->setFilters(['StringTrim'])
            ->setValidators([
                'NotEmpty',
                ['date', false, ['YYYY-MM-DD']], ])
            ->setDecorators(['ViewHelper'])
        ;
        $startDate->setAttrib('alt', 'date');
        $this->addElement($startDate);

        // Add start time element
        $startTime = new Zend_Form_Element_Text('his_time_start');
        $startTime->class = 'input_text';
        $startTime->setRequired(true)
            ->setValue('00:00')
            ->setFilters(['StringTrim'])
            ->setValidators([
                'NotEmpty',
                ['date', false, ['HH:mm']],
                ['regex', false, ['/^[0-2]?[0-9]:[0-5][0-9]$/', 'messages' => _('Invalid character entered')]], ])
            ->setDecorators(['ViewHelper'])
        ;
        $startTime->setAttrib('alt', 'time');
        $this->addElement($startTime);

        // Add end date element
        $endDate = new Zend_Form_Element_Text('his_date_end');
        $endDate->class = 'input_text';
        $endDate->setRequired(true)
            ->setLabel(_('Date End:'))
            ->setValue(date('Y-m-d'))
            ->setFilters(['StringTrim'])
            ->setValidators([
                'NotEmpty',
                ['date', false, ['YYYY-MM-DD']], ])
            ->setDecorators(['ViewHelper'])
        ;
        $endDate->setAttrib('alt', 'date');
        $this->addElement($endDate);

        // Add end time element
        $endTime = new Zend_Form_Element_Text('his_time_end');
        $endTime->class = 'input_text';
        $endTime->setRequired(true)
            ->setValue('01:00')
            ->setFilters(['StringTrim'])
            ->setValidators([
                'NotEmpty',
                ['date', false, ['HH:mm']],
                ['regex', false, ['/^[0-2]?[0-9]:[0-5][0-9]$/', 'messages' => _('Invalid character entered')]], ])
            ->setDecorators(['ViewHelper'])
        ;
        $endTime->setAttrib('alt', 'time');
        $this->addElement($endTime);
    }
}
