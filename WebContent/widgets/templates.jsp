<script type="text/html" id="ui-select">
{{if list}}
    {{if wrapper}}
    <select{{if id}} id="{{id}}"{{/if}}{{if name}} name="{{name}}"{{/if}}{{if className}} class="{{className}}"{{/if}}{{if multiple}} multiple="multiple"{{/if}}{{if attrs}}{{each attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>
    {{/if}}
    {{each list as item i}}
        <option index="{{i}}" {{if item.id}} id="{{item.id}}"{{/if}}  {{if item.value}} value="{{item.value}}"{{else}}  value="{{item.id || ''}}"  {{/if}}   {{if selected}} selected="selected"{{/if}}{{if item.attrs}}{{each item.attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>{{item.name || item.id || item.value || item.label}}</option>
        {{if item.list}}
        <optgroup index="{{i}}" label="{{item.label}}"{{if item.attrs}}{{each item.attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>
        {{each item.list as opt j}}
            <option index="{{i}}{{j}}" {{if opt.id}} id="{{opt.id}}"{{/if}}   {{if value}}value="{{opt.value}}"{{/if}} {{if selected}} selected="selected"{{/if}}{{if opt.attrs}}{{each opt.attrs}} {{$index}}="{{$value}}"{{/each}}{{/if}}>{{item.name || item.id || item.value || item.label}}</option>
        {{/each}}
        </optgroup>
		{{/if}}
    {{/each}}
    {{if wrapper}}
    </select>
    {{/if}}
{{/if}}
</script>