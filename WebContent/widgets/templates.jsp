<script type="text/html" id="ui-select">
{{if list}}
    <select{{if id}} id="{{id}}"{{/if}}{{if name}} name="{{name}}"{{/if}}{{if className}} class="{{className}}"{{/if}}{{if multiple}} multiple="multiple"{{/if}}{{if attrs}}{{each attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>
    {{each list as item i}}
        {{if item.value}}
        <option index="{{i}}" value="{{item.value}}"{{if selected}} selected="selected"{{/if}}{{if item.attrs}}{{each item.attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>{{item.label || item.value}}</option>
        {{else if item.list}}
        <optgroup index="{{i}}" label="{{item.label}}"{{if item.attrs}}{{each item.attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>
        {{each item.list as opt j}}
            <option index="{{i}}{{j}}" value="{{opt.value}}"{{if selected}} selected="selected"{{/if}}{{if opt.attrs}}{{each opt.attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>{{opt.label || opt.value}}</option>
        {{/each}}
        </optgroup>
        {{/if}}
    {{/each}}
    </select>
{{/if}}
</script>
