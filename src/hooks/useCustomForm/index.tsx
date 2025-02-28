import { TableFilterType } from '@/common';
import { useApi, useInit } from '@/hooks';
import {
  Form,
  Input,
  Select,
  DatePicker,
  FormProps,
  InputNumber,
  FormInstance,
} from 'antd';
import { forEachObjIndexed, type } from 'ramda';
import update from 'immutability-helper';
import './index.scss';
import { createContext, FC, useContext, useEffect, useState } from 'react';
import componentData from 'typings';
import moment from 'moment';
import { dateformatOut, datetimeformatOut, formatDate } from '@/utils';
import useUploadImg from '../useUploadImg';
import apiInterface from 'api';

const errContext = createContext<{
  errData: apiInterface.ErrData | null | undefined;
  setErrData: componentData.CustomFormHooks['setErrData'] | null;
}>({ errData: null, setErrData: null });

const _Input: FC<{ item: componentData.PropData; password?: boolean }> = (
  props,
) => {
  const { item, password } = props;
  return (
    <BaseFormItem item={item}>
      <Input
        type={password ? 'password' : 'text'}
        placeholder={item?.holder}
      ></Input>
    </BaseFormItem>
  );
};

const _InputNumber: FC<{ item: componentData.PropData }> = (props) => {
  const { item } = props;
  return (
    <BaseFormItem item={item}>
      <InputNumber placeholder={item?.holder}></InputNumber>
    </BaseFormItem>
  );
};

const _DateRangePicker: FC<{ item: componentData.PropData }> = (props) => {
  const { item } = props;
  return (
    <BaseFormItem item={item}>
      <DatePicker.RangePicker
        placeholder={item?.holderList}
      ></DatePicker.RangePicker>
    </BaseFormItem>
  );
};

const _DatePicker: FC<{
  item: componentData.PropData;
  withoutTime?: boolean;
}> = (props) => {
  const { item, withoutTime } = props;
  const [value, setValue] = useState<any>();
  return (
    <BaseFormItem item={item}>
      <DatePicker
        value={value}
        onChange={(date) => {
          if (withoutTime) {
            setValue(date?.set({ hour: 0, minute: 0, second: 0 }));
          } else {
            setValue(date);
          }
        }}
        placeholder={item.holder}
        format={withoutTime ? dateformatOut : datetimeformatOut}
        showTime={
          withoutTime
            ? false
            : {
                defaultValue: moment('00:00:00'),
              }
        }
      ></DatePicker>
    </BaseFormItem>
  );
};

const _Select: FC<{ item: componentData.PropData; muit?: boolean }> = (
  props,
) => {
  const { Option } = Select;
  const { item, muit } = props;
  let { selectData, holder } = item;
  let options = selectData;
  if (typeof selectData == 'function') {
    const { loading, setLoading, setParams, data, errorData } = useInit(
      props.item.selectData,
      item.selectRequestParams,
    );
    options = data.data?.content || data.data || [];
  }
  return (
    <BaseFormItem item={item}>
      <Select
        mode={muit ? 'multiple' : undefined}
        placeholder={holder}
        allowClear={true}
        dropdownMatchSelectWidth={false}
      >
        {options.map(
          (option: {
            id: string;
            string?: string;
            content?: string;
            [index: string]: any;
          }) => (
            <Option
              key={option[item.searchOption?.keyProp || 'id']}
              value={option[item.searchOption?.keyProp || 'id']}
            >
              {item.searchOption?.labelProp
                ? option[item.searchOption?.labelProp]
                : option.string || option.content}
            </Option>
          ),
        )}
      </Select>
    </BaseFormItem>
  );
};

const _SelectSearch: FC<{
  item: componentData.PropData;
  form: FormInstance<any>;
}> = (props) => {
  const [timerContainer] = useState<any>({ timer: undefined });
  const [init, setInit] = useState(false);
  const { Option } = Select;
  const { item, form } = props;
  let { selectData, searchOption, holder } = item;
  const { loading, setLoading, setParams, data, errorData } = useApi(
    selectData,
    {},
  );
  const request = (value: any) => {
    setParams({
      search: value,
    });
    setLoading(true);
  };
  let besetValue = form.getFieldValue(item.key);
  useEffect(() => {
    if (besetValue && !init) {
      setInit(true);
      request(besetValue);
    }
  }, [besetValue]);
  return (
    <BaseFormItem item={item}>
      <Select
        placeholder={holder}
        style={{ minWidth: '8rem' }}
        showSearch={true}
        allowClear={true}
        dropdownMatchSelectWidth={false}
        filterOption={false}
        onSearch={(value) => {
          if (value) {
            if (timerContainer.timer) {
              clearTimeout(timerContainer.timer);
              timerContainer.timer = null;
            }
            timerContainer.timer = setTimeout(() => request(value), 200);
          }
        }}
        loading={loading}
      >
        {data.data
          ? data.data.map((item: any) => (
              <Option
                key={item[searchOption?.keyProp || '_null']}
                value={item[searchOption?.keyProp || '_null']}
              >
                {item[searchOption?.labelProp || '无']}
              </Option>
            ))
          : null}
      </Select>
    </BaseFormItem>
  );
};

// const _MuitSelect: FC<{ item: componentData.PropData }> = ({ item }) => {
//   return (
//     <BaseFormItem item={item}>
//       <Select mode="multiple" allowClear></Select>;
//     </BaseFormItem>
//   );
// };

const _Image: FC<{
  item: componentData.PropData;
  form: FormInstance<any>;
  onValuesChange: FormProps['onValuesChange'];
}> = ({ item, form, onValuesChange }) => {
  const { urlList, UploadImg: _UploadImg } = useUploadImg();
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (!first) {
      const newValue = update(form.getFieldsValue(), {
        $merge: { [item.key]: urlList[0] },
      });
      onValuesChange && onValuesChange(newValue, newValue);
      form.setFieldsValue(newValue);
    } else setFirst(false);
  }, [urlList]);
  return (
    <>
      <BaseFormItem item={item}>
        <Input placeholder={item.holder}></Input>
      </BaseFormItem>
      {_UploadImg}
    </>
  );
};

const BaseFormItem: FC<{ item: componentData.PropData }> = ({
  item,
  children,
}) => {
  const _errContext = useContext(errContext);
  return (
    <Form.Item
      colon={false}
      label={item.name}
      name={item.key}
      rules={item.rules}
      hidden={item.hidden}
      validateStatus={
        _errContext.errData && _errContext.errData[item.key]
          ? 'error'
          : undefined
      }
      help={
        _errContext.errData && _errContext.errData[item.key]
          ? _errContext.errData[item.key]
          : undefined
      }
    >
      {children}
    </Form.Item>
  );
};

const ErrorProp: FC = () => {
  return <div>错误的过滤器类型</div>;
};

const validateMessages: FormProps['validateMessages'] = {
  required: '必须输入 ${label}',
  number: {
    range: '${label} 必须在 ${min} 和 ${max}（不包含） 之间',
    min: '${label} 必须大于等于 ${min}',
  },
  types: {
    number: '${label} 输入不合法',
  },
};

const useCustomForm = (
  propData: componentData.PropData[],
  onChange: componentData.OnFormChange,
  formProps?: FormProps,
): componentData.CustomFormHooks => {
  const [timerContainer, setTimerContainer] = useState<any>({
    timer: undefined,
  });
  const [form] = Form.useForm();
  const [validatedContainer, setValidated] = useState({ validated: false });
  const [errData, setErrData] = useState<
    apiInterface.ErrData | null | undefined
  >(null);
  const [defaultFormData, setDefaultFormData] = useState<any>({});
  const [_propData, setPropData] = useState<componentData.PropData[]>(propData);
  const onValuesChange: FormProps['onValuesChange'] = (
    changeValues,
    allValues,
  ) => {
    if (timerContainer.timer) {
      clearTimeout(timerContainer.timer);
      timerContainer.timer = null;
    }
    function doit() {
      forEachObjIndexed((value: any, key: any, obj: any) => {
        // 服务端的错误提示在变更输入后删去
        errData && setErrData(update(errData, { $unset: [key] }));
        // 判断时间特殊处理
        if (value && value._isAMomentObject) {
          allValues = update(allValues, {
            [key]: {
              $set: formatDate(value),
            },
          });
        }
        // 判断范围时间特殊处理
        if (
          value &&
          type(value) === 'Array' &&
          value.length === 2 &&
          value[0]._isAMomentObject
        ) {
          propData.forEach((item) => {
            if (item.key === key && item.timeRange) {
              allValues = update(allValues, {
                $unset: [key],
                [item.timeRange.rangeStartProp]: {
                  $set: value[0].format('YYYY-MM-DD'),
                },
                [item.timeRange.rangeEndProp]: {
                  $set: value[1].format('YYYY-MM-DD'),
                },
              });
            }
          });
        }
      }, allValues);
      onChange(allValues);
    }
    timerContainer.timer = setTimeout(doit, 50);
  };
  const result = _propData.map((item, index) => {
    if (item.default) defaultFormData[item.key] = item.default;
    switch (item.type) {
      case TableFilterType.str:
        return <_Input key={item.key} item={item} />;
      case TableFilterType.number:
        return <_InputNumber key={item.key} item={item} />;
      case TableFilterType.timeRange:
        return <_DateRangePicker key={item.key} item={item} />;
      case TableFilterType.time:
        return <_DatePicker key={item.key} item={item} />;
      case TableFilterType.timeWithoutTime:
        return <_DatePicker key={item.key} item={item} withoutTime={true} />;
      case TableFilterType.select:
        return <_Select key={item.key} item={item} />;
      case TableFilterType.selectSearch:
        return <_SelectSearch key={item.key} item={item} form={form} />;
      case TableFilterType.muitSelect:
        return <_Select key={item.key} item={item} muit={true} />;
      case TableFilterType.image:
        return (
          <_Image
            key={item.key}
            item={item}
            form={form}
            onValuesChange={onValuesChange}
          />
        );
      case TableFilterType.password:
        return <_Input key={item.key} item={item} password={true} />;
      default:
        return <ErrorProp />;
    }
  });
  useEffect(() => {
    onChange(defaultFormData);
  }, []);
  const validateFields = async () => {
    try {
      await form.validateFields();
      validatedContainer.validated = true;
    } catch (errorInfo) {
      validatedContainer.validated = false;
    }
  };
  const _form =
    _propData.length > 0 ? (
      <errContext.Provider value={{ errData, setErrData }}>
        <Form
          initialValues={defaultFormData}
          validateMessages={validateMessages}
          form={form}
          className="filter-form"
          labelAlign="right"
          layout={'inline'}
          onValuesChange={onValuesChange}
          {...formProps}
        >
          {result}
        </Form>
      </errContext.Provider>
    ) : undefined;
  return {
    form: _form,
    validateFields,
    validatedContainer,
    formRef: form,
    setPropData,
    setErrData,
  };
};

export default useCustomForm;
